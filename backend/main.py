"""
ChessChronicles Backend - FastAPI Server
Real-time chess game analysis using Stockfish engine with CPL (Centipion Loss) classification.
WebSocket endpoint for streaming analysis results to frontend.
"""
from fastapi import FastAPI, WebSocket, Request
from fastapi.middleware.cors import CORSMiddleware
import chess
import chess.pgn
import io
import asyncio
import logging
import requests

from analyzer import (
    StockfishEngine, 
    classify_move_quality_cpl,
    get_evaluation_bar_data,
    decode_stockfish_mate,
    THEORETICAL_OPENINGS,
    calculate_stats
)

from dotenv import load_dotenv
import os

load_dotenv()

# Get environment variables with proper defaults
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",") if origin.strip()]

# Configure logging for application monitoring
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize FastAPI application
app = FastAPI(
    title="ChessChronicles Backend",
    version="1.0",
    description="Real-time chess analysis using Stockfish"
)

# Middleware to log incoming requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log incoming HTTP requests"""
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    response = await call_next(request)
    return response

# Configure CORS to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "WebSocket"],
    allow_headers=["Content-Type"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for deployment monitoring"""
    return {"status": "ok", "version": "1.0"}


# REST API Routes
# Fetch game PGN data from Chess.com API

@app.get("/game/live/{game_id}")
async def get_live_game_pgn(game_id: str):
    """Fetch PGN from a live Chess.com game"""
    try:
        api_url = f"https://www.chess.com/callback/live/game/{game_id}"
        headers = {'User-Agent': 'ChessChronicles/1.0'}
        response = requests.get(api_url, headers=headers, timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logger.error(f"Failed to fetch live game {game_id}: {e}")
        return {"error": "Failed to fetch game"}


@app.get("/game/daily/{game_id}")
async def get_daily_game_pgn(game_id: str):
    """Fetch PGN from a daily Chess.com game"""
    try:
        api_url = f"https://www.chess.com/callback/daily/game/{game_id}"   
        headers = {'User-Agent': 'ChessChronicles/1.0'}
        response = requests.get(api_url, headers=headers, timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logger.error(f"Failed to fetch daily game {game_id}: {e}")
        return {"error": "Failed to fetch game"}


# WebSocket Analysis Endpoint
# Real-time streaming of move analysis and evaluation

@app.websocket("/ws/analyze")
async def websocket_analyze(websocket: WebSocket):
    """
    WebSocket endpoint for real-time chess analysis.
    Accepts PGN data and streams back move-by-move analysis results.
    """
    await websocket.accept()
    
    try:
        data = await websocket.receive_json()
        pgn_text = data.get('pgn')
        game_id = data.get('game_id', 'unknown')
        
        if not pgn_text:
            await websocket.send_json({
                'type': 'analysis_error',
                'error': 'PGN missing'
            })
            await websocket.close()
            return
        
        await run_full_analysis(pgn_text, game_id, websocket)
        
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.send_json({
                'type': 'analysis_error',
                'error': str(e)
            })
        except:
            pass
        finally:
            await websocket.close()


async def run_full_analysis(pgn_text: str, game_id: str, websocket: WebSocket):
    """
    Perform complete game analysis using CPL (Centipion Loss) classification.
    
    Analysis flow:
    1. Parse PGN and extract all moves
    2. Initialize Stockfish engine (persistent for entire game)
    3. For each move: get best evaluation, calculate CPL, classify move quality
    4. Stream results via WebSocket
    5. Compute aggregate statistics by move quality category
    """
    engine = None
    try:
        # Parse PGN and validate game structure
        pgn = io.StringIO(pgn_text)
        game = chess.pgn.read_game(pgn)
        
        if not game:
            await websocket.send_json({
                'type': 'analysis_error',
                'error': 'PGN invalid'
            })
            return
        
        # Extract player names from PGN headers
        white_player = game.headers.get('White', 'White')
        black_player = game.headers.get('Black', 'Black')
        
        # Build move list with FEN positions before and after each move
        moves_list = []
        board = game.board()
        for i, move in enumerate(game.mainline_moves()):
            move_color = 'white' if board.turn == chess.WHITE else 'black'
            san = board.san(move)
            fen_before = board.fen()
            board.push(move)
            moves_list.append({
                'index': i,
                'uci': move.uci(),
                'san': san,
                'color': move_color,
                'fen_before': fen_before,
                'fen_after': board.fen()
            })
        
        total_moves = len(moves_list)
        
        # Signal analysis start to client
        await websocket.send_json({
            'type': 'analysis_start',
            'total_moves': total_moves,
            'white': white_player,
            'black': black_player,
            'game_id': game_id
        })
        
        # Initialize persistent Stockfish engine
        loop = asyncio.get_event_loop()
        stockfish_path = os.getenv("STOCKFISH_PATH", "/usr/bin/stockfish")
        stockfish_depth = int(os.getenv("STOCKFISH_DEPTH", "20"))
        
        try:
            engine = await loop.run_in_executor(
                None, 
                lambda: StockfishEngine(stockfish_path, depth=stockfish_depth)
            )
        except Exception as e:
            logger.error(f"Failed to initialize Stockfish at {stockfish_path}: {e}")
            await websocket.send_json({
                'type': 'analysis_error',
                'error': f'Stockfish initialization failed: {str(e)}'
            })
            await websocket.close()
            return

        moves_analysis = []
        
        # Analyze each move sequentially
        for idx, move_data in enumerate(moves_list):
            try:
                # Get best move analysis for current position
                best_analysis = await loop.run_in_executor(
                    None,
                    lambda fen=move_data['fen_before']: engine.get_analysis(fen)
                )
                
                if 'error' in best_analysis:
                    move_quality = 'unknown'
                    eval_jouee = 0
                    best_move_uci = None
                    best_move_san = None
                else:
                    # Optimal evaluation from Stockfish analysis
                    eval_optimale = best_analysis['score']
                    best_move_uci = best_analysis['best_move']
                    move_uci = move_data['uci']
                    
                    # Determine player perspective (1 for white, -1 for black)
                    board_temp = chess.Board(move_data['fen_before'])
                    perspective = 1 if board_temp.turn == chess.WHITE else -1
                    
                    # Convert best move to standard algebraic notation (SAN)
                    best_move_san = board_temp.san(chess.Move.from_uci(best_move_uci))
                    
                    # Calculate actual evaluation after move played
                    if move_uci == best_move_uci:
                        eval_jouee = eval_optimale
                    else:
                        board_temp.push(chess.Move.from_uci(move_uci))
                        analysis_after = await loop.run_in_executor(
                            None,
                            lambda fen=board_temp.fen(): engine.get_analysis(fen)
                        )
                        eval_jouee = analysis_after['score'] if 'error' not in analysis_after else eval_optimale
                    
                    # Calculate CPL (Centipion Loss): the evaluation difference after move
                    # Special handling for mate scores: don't compare mat vs centipion values
                    is_optimal_mate = abs(eval_optimale) > 99500
                    is_played_mate = abs(eval_jouee) > 99500
                    
                    if is_optimal_mate and is_played_mate:
                        # Both are mate - compare who wins faster
                        # Extract mate moves: white mat in N = 100000 - N, black mat in N = -100000 - N
                        
                        # --- CORRECTION (la même que la dernière fois, mais nécessaire) ---
                        # Décode le score normalisé en nombre de coups
                        # E.g., -99997 (mat en 3 noir) -> eval + 100000 = 3
                        # E.g., 99997 (mat en 3 blanc) -> 100000 - eval = 3
                        
                        optimal_mate = (100000 - eval_optimale) if eval_optimale > 0 else (eval_optimale + 100000)
                        played_mate = (100000 - eval_jouee) if eval_jouee > 0 else (eval_jouee + 100000)
                        
                        # --- FIN DE LA CORRECTION ---

                        # CPL = how many more moves to mate (if slower) or 0 if faster
                        cpl = max(0, played_mate - optimal_mate)
                    elif is_optimal_mate and not is_played_mate:
                        # Optimal is mate but played isn't - big mistake
                        cpl = 500  # Cap CPL at 500 for practical purposes
                    elif not is_optimal_mate and is_played_mate:
                        # Played move leads to mate - treat as excellent
                        cpl = 0
                    else:
                        # Normal position evaluation difference
                        cpl = (eval_optimale - eval_jouee) * perspective
                        cpl = max(0, cpl)
                    
                    # Check if move is in theoretical opening repertoire
                    is_opening = (move_data['fen_before'] in THEORETICAL_OPENINGS and 
                                move_uci in THEORETICAL_OPENINGS[move_data['fen_before']])
                    
                    # Classify move quality based on CPL magnitude
                    move_quality = classify_move_quality_cpl(
                        cpl,
                        best_move_played=(move_uci == best_move_uci),
                        is_opening=is_opening
                    )
                
                # Get evaluation bar data (centipion to percentage conversion)
                eval_after_move_data = get_evaluation_bar_data(eval_jouee) if 'error' not in best_analysis else None
                
                # Simplify evaluation data for transmission
                eval_after_move_simplified = None
                if eval_after_move_data:
                    eval_after_move_simplified = {
                        'advantage_color': eval_after_move_data['advantage_color'],
                        'bar_percentage': eval_after_move_data['bar_percentage'],
                        'raw_score': eval_after_move_data['raw_score']
                    }
                
                # Decode mate sequences from high evaluation scores
                mate_info_data = decode_stockfish_mate(eval_jouee) if 'error' not in best_analysis else None
                mate_info_simplified = None
                if mate_info_data:
                    mate_info_simplified = {
                        'is_mate_sequence': mate_info_data['is_mate_sequence'],
                        'mate_in': mate_info_data['mate_in'],
                        'winning_side': mate_info_data['winning_side']
                    }
                
                # Build move analysis result with 7 essential fields
                move_analysis = {
                    'index': move_data['index'],
                    'san': move_data['san'],
                    'color': move_data['color'],
                    'quality': move_quality,
                    'best_move': best_move_san,
                    'eval_after_move': eval_after_move_simplified,
                    'mate_info': mate_info_simplified
                }
                
                moves_analysis.append(move_analysis)
                
            except Exception as e:
                logger.error(f"Move analysis error {idx}: {e}")
                # On error, add move with unknown quality
                move_analysis = {
                    'index': move_data['index'],
                    'san': move_data['san'],
                    'color': move_data['color'],
                    'quality': 'unknown',
                    'best_move': None,
                    'eval_after_move': None,
                    'mate_info': None
                }
                moves_analysis.append(move_analysis)
            
            # Stream progress update to client
            progress = ((idx + 1) / total_moves) * 100
            await websocket.send_json({
                'type': 'analysis_progress',
                'move_index': move_data['index'],
                'progress': progress,
                'moves_analyzed': idx + 1
            })
            
            # Yield to event loop to prevent blocking
            await asyncio.sleep(0.01)
        
        # Calculate aggregate statistics by move quality
        white_stats = calculate_stats([m for m in moves_analysis if m['color'] == 'white'])
        black_stats = calculate_stats([m for m in moves_analysis if m['color'] == 'black'])
        
        # Send complete analysis results grouped by player
        await websocket.send_json({
            'type': 'analysis_complete',
            'game_id': game_id,
            'white': {
                'player': white_player,
                'stats': white_stats,
                'moves': [m for m in moves_analysis if m['color'] == 'white']
            },
            'black': {
                'player': black_player,
                'stats': black_stats,
                'moves': [m for m in moves_analysis if m['color'] == 'black']
            }
        })
        
        logger.info(f"✅ Analysis complete: {total_moves} moves")
        
        
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        try:
            await websocket.send_json({
                'type': 'analysis_error',
                'error': str(e)
            })
        except:
            pass
    
    finally:
        # Clean up Stockfish process
        if engine:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, engine.quit)


@app.get("/health")
async def health():
    """Health check endpoint for monitoring"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, 
                host=os.getenv("SERVER_HOST"), 
                port=int(os.getenv("SERVER_PORT")))
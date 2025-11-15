"""
Chess Analysis Module - Stockfish Engine Integration
Handles move classification using CPL (Centipion Loss) algorithm.
Provides position evaluation, mate detection, and move quality assessment.
"""
import subprocess
import re
import logging
import chess

logger = logging.getLogger(__name__)

# Theoretical opening moves - used to tag opening theory moves
# Future: Consider integrating a dedicated opening database (e.g., ECO database)
THEORETICAL_OPENINGS = {
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1": ["e2e4", "d2d4", "c2c4", "g1f3"],
    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1": ["e7e5", "c7c5", "e7e6", "d7d5"],
    "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1": ["d7d5", "c7c5", "e7e6", "f7f6"],
}


class StockfishEngine:
    """
    Persistent Stockfish engine wrapper.
    Maintains single process for entire analysis session to optimize performance.
    UCI protocol communication for move analysis and position evaluation.
    """
    
    def __init__(self, stockfish_path: str, depth: int = 20):
        """Initialize engine with specified search depth (default 20 plies)"""
        self.depth = depth
        self.process = None
        self._start_engine(stockfish_path)
    
    def _start_engine(self, stockfish_path: str):
        """Start Stockfish process and perform initialization handshake"""
        try:
            self.process = subprocess.Popen(
                stockfish_path,
                universal_newlines=True,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                bufsize=1
            )
            
            # UCI initialization protocol
            self._send_command("uci")
            self._wait_for_line("uciok")
            self._send_command("isready")
            self._wait_for_line("readyok")
            
            logger.info(f"✅ Stockfish started (depth={self.depth})")
            
        except Exception as e:
            logger.error(f"❌ Stockfish startup error: {e}")
            raise
    
    def _send_command(self, command: str):
        """Send UCI command to Stockfish process"""
        self.process.stdin.write(command + "\n")
        self.process.stdin.flush()
    
    def _wait_for_line(self, expected: str) -> str:
        """Block until expected line received from engine output"""
        while True:
            line = self.process.stdout.readline().strip()
            if expected in line:
                return line
    
    def get_analysis(self, fen: str) -> dict:
        """
        Analyze FEN position and return best move with evaluation score.
        Returns: {'best_move': 'e2e4', 'score': 45} or {'error': '...'}
        """
        try:
            # --- CORRECTION ICI ---
            # Déterminer la perspective (qui doit jouer) à partir du FEN
            # fen.split()[1] == 'w' (White) ou 'b' (Black)
            perspective = 1 if fen.split()[1] == 'w' else -1
            
            self._send_command(f"position fen {fen}")
            self._send_command(f"go depth {self.depth}")
            
            best_move = None
            score_cp = None
            score_mate = None # C'est le score du point de vue de Stockfish (absolu/blanc)
            
            # Parse engine output until bestmove found
            while True:
                line = self.process.stdout.readline().strip()
                
                if line.startswith("info depth"):
                    # Extract centipion score (cp) or mate score
                    score_cp_match = re.search(r'score cp (\-?\d+)', line)
                    score_mate_match = re.search(r'score mate (\-?\d+)', line)
                    
                    if score_cp_match:
                        score_cp = int(score_cp_match.group(1))
                        score_mate = None
                    elif score_mate_match:
                        # Le score 'mate' est RELATIF au côté qui doit jouer
                        mate_relative = int(score_mate_match.group(1))
                        score_cp = None
                        
                        # --- CORRECTION ICI ---
                        # Convertir le score mat relatif en score absolu (point de vue des Blancs)
                        if perspective == 1:
                            # C'est aux Blancs de jouer. 'mate 3' -> 3. 'mate -3' -> -3.
                            score_mate = mate_relative
                        else:
                            # C'est aux Noirs de jouer. Nous devons inverser.
                            # 'mate 3' (bon pour les Noirs) -> -3
                            # 'mate -3' (mauvais pour les Noirs) -> 3
                            score_mate = -mate_relative
                
                if line.startswith("bestmove"):
                    parts = line.split()
                    best_move = parts[1] if len(parts) >= 2 else None
                    break
            
            # _normalize_score reçoit maintenant un score 'mate'
            # qui est TOUJOURS du point de vue des Blancs
            final_score = self._normalize_score(score_cp, score_mate)
            
            return {
                'best_move': best_move,
                'score': final_score
            }
            
        except Exception as e:
            logger.error(f"Analysis error: {e}")
            return {'error': str(e)}
    
    def _normalize_score(self, score_cp: int, score_mate: int) -> int:
        """
        Normalize score to centipion scale.
        score_mate EST ATTENDU du point de vue des BLANCS.
        (positif = mat des blancs, négatif = mat des noirs)
        
        Mate scores encoded as: 100000 - mate_moves (white win) or -100000 + mate_moves (black win)
        """
        if score_mate is not None:
            # score_mate est positif pour le mat des blancs, négatif pour le mat des noirs
            if score_mate > 0:
                # Les Blancs gagnent en N coups: 
                # E.g., mat en 3 coups (score_mate=3) = 99997
                return 100000 - score_mate
            else:
                # Les Noirs gagnent en N coups:  
                # E.g., mat des noirs en 3 coups (score_mate=-3) -> -100000 + 3 = -99997
                return -100000 + abs(score_mate)
        elif score_cp is not None:
            return score_cp
        return 0
    
    def quit(self):
        """Gracefully terminate Stockfish process"""
        try:
            self._send_command("quit")
            self.process.terminate()
            self.process.wait(timeout=5)
            logger.info("✅ Stockfish closed")
        except Exception as e:
            logger.warning(f"Stockfish close error: {e}")
            if self.process:
                self.process.kill()


def classify_move_quality_cpl(cpl: int, best_move_played: bool, is_opening: bool = False) -> str:
    """
    Classify move quality based on CPL (Centipion Loss).
    CPL = (best_eval - played_eval) * perspective
    
    Categories:
    - theoretical: opening theory move
    - excellent: best move or minimal loss
    - good: small inaccuracy (1-15 cp)
    - inaccuracy: moderate loss (16-75 cp)
    - mistake: significant loss (76-150 cp)
    - blunder: major loss (150+ cp)
    """
    if is_opening:
        return 'theoretical'
    
    if best_move_played:
        return 'excellent'
    
    if cpl <= 15:
        return 'good'
    elif cpl <= 75:
        return 'inaccuracy'
    elif cpl <= 150:
        return 'mistake'
    else:
        return 'blunder'


def calculate_stats(moves: list) -> dict:
    """
    Aggregate statistics for move set by quality category.
    Returns count of each quality level (theoretical, excellent, good, etc.)
    """
    stats = {
        'theoretical': 0,
        'excellent': 0,
        'good': 0,
        'inaccuracy': 0,
        'mistake': 0,
        'blunder': 0,
        'unknown': 0,
        'total': len(moves)
    }
    
    for move in moves:
        quality = move.get('quality', 'unknown')
        if quality in stats:
            stats[quality] += 1
    
    return stats


def get_evaluation_bar_data(eval_centipions: int) -> dict:
    """
    Convert centipion evaluation to evaluation bar display data.
    Returns percentage position (0-100) for bar visualization.
    Clamped at ±500 cp for bar (±5 pawn advantage at extremes).
    Special handling for mate scores (±99500+).
    """
    # Check if this is a mate score
    is_mate = abs(eval_centipions) > 99500
    
    if is_mate:
        # For mate scores, show decisive advantage (100% for winner, 0% for loser)
        if eval_centipions > 99500:
            advantage_color = 'white'
            score_str = "M"  # Mate indicator
            bar_percentage = 100
            raw_score = 999.99  # Very high positive
        else:  # eval_centipions < -99500
            advantage_color = 'black'
            score_str = "M"  # Mate indicator
            bar_percentage = 0
            raw_score = -999.99  # Very high negative
    else:
        # Normal centipion scores
        score_pions = eval_centipions / 100.0
        
        # Determine advantage color and format score
        if eval_centipions > 0:
            advantage_color = 'white'
            score_str = f"+{abs(score_pions):.2f}"
        elif eval_centipions < 0:
            advantage_color = 'black'
            score_str = f"-{abs(score_pions):.2f}"
        else:
            advantage_color = 'white'
            score_str = "0.00"
        
        # Clamp score and convert to bar percentage (50% = equal)
        clamped = max(-500, min(500, eval_centipions))
        bar_percentage = 50 + (clamped / 500.0) * 50
        raw_score = score_pions
    
    return {
        'score': score_str,
        'centipions': eval_centipions,
        'advantage_color': advantage_color,
        'bar_percentage': bar_percentage,
        'raw_score': raw_score
    }


def decode_stockfish_mate(eval_score: int) -> dict:
    """
    Detect mate sequences from Stockfish evaluation scores.
    Format: 100000 - N (white wins in N moves), -100000 + N (black wins in N moves)
    E.g., 99997 = white mate in 3, -99997 = black mate in 3
    """
    threshold = 99500
    
    if eval_score > threshold:
        # White wins: 100000 - mate_in = eval_score
        # So: mate_in = 100000 - eval_score
        moves_to_mate = 100000 - eval_score
        return {
            'is_mate_sequence': True,
            'mate_in': moves_to_mate,
            'winning_side': 'white'
        }
    elif eval_score < -threshold:
        # Black wins: -100000 + mate_in = eval_score
        # So: mate_in = eval_score + 100000
        moves_to_mate = eval_score + 100000
        return {
            'is_mate_sequence': True,
            'mate_in': moves_to_mate,
            'winning_side': 'black'
        }
    else:
        return {
            'is_mate_sequence': False,
            'mate_in': None,
            'winning_side': None
        }
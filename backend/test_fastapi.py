#!/usr/bin/env python3.11
"""
Test d'analyse avec WebSocket natif FastAPI
Remplace le test SocketIO précédent
"""

import asyncio
import websockets
import json
import sys

MY_GAME_PGN = """
[Event "Live Chess"]
[Site "Chess.com"]
[Date "2025.10.09"]
[Round "?"]
[White "cirious"]
[Black "Rishi9191"]
[Result "1-0"]
[TimeControl "600"]
[WhiteElo "855"]
[BlackElo "843"]
[Termination "cirious a gagné par échec et mat"]
[ECO "D10"]
[EndTime "16:16:15 GMT+0000"]
[Link "https://www.chess.com/game/live/144094279896"]

1. d4 c6 2. c4 d5 3. Nf3 Bf5 4. Nc3 e6 5. e3 Bd6 6. c5 Bc7 7. Be2 Nd7 8. O-O
Ngf6 9. Ne5 Nxe5 10. dxe5 Bxe5 11. Bd2 h5 12. Qb3 Qc7 13. e4 Bg4 14. Bg5 Bxh2+
15. Kh1 Bxe2 16. Nxe2 Be5 17. f4 Ng4 18. fxe5 Qxe5 19. g3 Qxe4+ 20. Rf3 Qxe2 21.
Kg1 Qh2+ 22. Kf1 Qh1+ 23. Ke2 Qxa1 24. Qxb7 O-O 25. Rxf7 Qg1 26. Rxg7+ Kh8 27.
Rh7+ Kg8 28. Qg7# 1-0
"""


async def test_analysis():
    """Test d'analyse WebSocket"""
    
    print("🎯 TEST D'ANALYSE FASTAPI + WEBSOCKET")
    print("=" * 60)
    print("Connexion au serveur WebSocket...\n")
    
    try:
        async with websockets.connect('ws://localhost:8000/ws/analyze') as websocket:
            print("✅ Connecté au serveur WebSocket\n")
            print("📤 Envoi de la partie pour analyse...\n")
            
            # Envoyer la requête d'analyse
            await websocket.send(json.dumps({
                'pgn': MY_GAME_PGN,
                'game_id': 'fastapi-test'
            }))
            
            # Recevoir les messages en temps réel
            while True:
                message = await websocket.recv()
                data = json.loads(message)
                event_type = data.get('type')
                
                if event_type == 'analysis_start':
                    print(f"🔍 Analyse démarrée")
                    print(f"   Blanc: {data.get('white')}")
                    print(f"   Noir: {data.get('black')}")
                    print(f"   Total coups: {data.get('total_moves')}\n")
                
                elif event_type == 'analysis_progress':
                    progress = data.get('progress', 0)
                    analyzed = data.get('moves_analyzed', 0)
                    print(f"\r   Progression: {progress:6.1f}% ({analyzed} coups)", end='', flush=True)
                
                elif event_type == 'analysis_complete':
                    print("\n\n✅ ANALYSE COMPLÈTE! (Logique CPL)\n")
                    
                    print("=" * 70)
                    white_data = data.get('white', {})
                    white_stats = white_data.get('stats', {})
                    
                    print(f"📊 BLANC ({white_data.get('player')})")
                    print(f"   Théoriques:  {white_stats.get('theoretical', 0):3d}")
                    print(f"   Excellents:  {white_stats.get('excellent', 0):3d}")
                    print(f"   Bons:        {white_stats.get('good', 0):3d}")
                    print(f"   Imprécis:    {white_stats.get('inaccuracy', 0):3d}")
                    print(f"   Erreurs:     {white_stats.get('mistake', 0):3d}")
                    print(f"   Blunders:    {white_stats.get('blunder', 0):3d}")
                    print(f"   Total:       {white_stats.get('total', 0):3d}")
                    
                    print()
                    
                    black_data = data.get('black', {})
                    black_stats = black_data.get('stats', {})
                    
                    print(f"📊 NOIR ({black_data.get('player')})")
                    print(f"   Théoriques:  {black_stats.get('theoretical', 0):3d}")
                    print(f"   Excellents:  {black_stats.get('excellent', 0):3d}")
                    print(f"   Bons:        {black_stats.get('good', 0):3d}")
                    print(f"   Imprécis:    {black_stats.get('inaccuracy', 0):3d}")
                    print(f"   Erreurs:     {black_stats.get('mistake', 0):3d}")
                    print(f"   Blunders:    {black_stats.get('blunder', 0):3d}")
                    print(f"   Total:       {black_stats.get('total', 0):3d}")
                    
                    print("=" * 70)
                    
                    # Afficher les meilleurs/pires coups
                    print(data)
                    break
                
                elif event_type == 'analysis_error':
                    print(f"\n❌ ERREUR: {data.get('error')}")
                    return False
    
    except Exception as e:
        print(f"\n❌ Erreur de connexion: {e}")
        print("\n💡 Assurez-vous que le serveur est lancé:")
        print("   cd backend && pip install -r requirements.txt")
        print("   python3.11 main.py")
        return False
    
    return True


if __name__ == '__main__':
    success = asyncio.run(test_analysis())
    sys.exit(0 if success else 1)

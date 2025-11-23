import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { withLang } from '../../i18n';
import { Layout } from '../../components/Layout';
import { SEO } from '../../components/SEO';
import { GameFallback } from '../../components/GameFallback';
import { useChessStore } from '../../store';
import { Chess } from 'chess.js';

type NavState = {
  username?: string;
  analyze?: boolean;
  pgn?: string;
  error?: string;
  white?: { username: string; rating?: number };
  black?: { username: string; rating?: number };
};

export default function GamePage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const state = (location.state || {}) as NavState;
  const { clearCurrentGame } = useChessStore();

  const [manualPgnInput, setManualPgnInput] = useState(state.pgn || '');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(state.error);

  useEffect(() => {
    if (!state.error) {
      clearCurrentGame();
    }
  }, [state.error, clearCurrentGame]);

  const handleInjectPGN = () => {
    const pgnToValidate = manualPgnInput.trim();

    if (!pgnToValidate) {
      setErrorMessage(t('analyze.error.emptyPgn', 'Veuillez saisir un PGN'));
      return;
    }

    try {
      const chess = new Chess();
      chess.loadPgn(pgnToValidate);
      const moves = chess.history();

      if (moves.length === 0) {
        setErrorMessage(
          t('analyze.error.noMovesFound', 'Aucun coup trouvé dans le PGN. Vérifiez le format.')
        );
        return;
      }

      navigate(withLang('/analyze'), {
        state: {
          pgn: pgnToValidate,
          username: state.username,
          analyze: state.analyze || false,
          white: state.white,
          black: state.black,
        },
      });
    } catch (err: unknown) {
      const rawError = err instanceof Error ? err.message : 'Format invalide';

      if (rawError.includes('Expected') && rawError.includes('found')) {
        setErrorMessage(t('analyze.error.invalidPgnFormat', 'Format PGN invalide.'));
        return;
      }

      if (rawError.includes('Invalid move') || rawError.includes('invalid move')) {
        const moveMatch = rawError.match(/:\s*(.+)$/);
        const moveDetail = moveMatch ? moveMatch[1].trim() : '';
        const errorMsg = moveDetail
          ? `${t('analyze.error.invalidMove', 'Coup invalide dans le PGN')} : ${moveDetail}`
          : t('analyze.error.invalidMove', 'Coup invalide dans le PGN.');
        setErrorMessage(errorMsg);
        return;
      }

      if (rawError.includes('Illegal move') || rawError.includes('illegal move')) {
        setErrorMessage(t('analyze.error.illegalMove', 'Le PGN contient des coups invalides.'));
        return;
      }

      setErrorMessage(t('analyze.error.invalidPgnFormat', 'Format PGN invalide.'));
    }
  };

  return (
    <Layout>
      <SEO
        title={t('analyze.title', 'Jeu')}
        description={t('analyze.description', 'Jouez aux échecs en ligne')}
      />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <section className="space-y-6">
          <GameFallback
            manualPgnInput={manualPgnInput}
            setManualPgnInput={setManualPgnInput}
            manualPgn={false}
            isError={!!errorMessage}
            onCancelManual={() => {
              setManualPgnInput('');
              setErrorMessage(undefined);
            }}
            onInjectPGN={handleInjectPGN}
            errorMessage={errorMessage}
          />
        </section>
      </main>
    </Layout>
  );
}

import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Game } from '../entity/Game';

const router = Router();
const gameRepository = AppDataSource.getRepository(Game);

// POST /api/games - creates a new Game row
router.post('/', async (req, res) => {
  try {
    const { playerIcon } = req.body;
    const game = new Game();
    if (playerIcon) {
      game.playerIcon = playerIcon;
    }
    const savedGame = await gameRepository.save(game);
    const nodeEnv = process.env.NODE_ENV || 'development';
    res.status(201).json({
      id: savedGame.id,
      startDate: savedGame.startDate,
      playerIcon: savedGame.playerIcon,
      showMovementToggle: nodeEnv === 'development',
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/games/:id/complete - sets endDate, won=1, elapsedTime
router.patch('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { elapsedTime, playerIcon } = req.body;

    if (elapsedTime === undefined) {
      return res.status(400).json({ error: 'elapsedTime is required in request body' });
    }

    const game = await gameRepository.findOneBy({ id });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    game.endDate = new Date();
    game.won = 1;
    game.elapsedTime = elapsedTime;
    if (playerIcon) {
      game.playerIcon = playerIcon;
    }

    await gameRepository.save(game);
    res.status(200).json({ message: 'Game completed successfully' });
  } catch (error) {
    console.error('Error completing game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/games/:id/abort - sets endDate, won=0, elapsedTime
router.patch('/:id/abort', async (req, res) => {
  try {
    const { id } = req.params;
    const { elapsedTime, playerIcon } = req.body;

    if (elapsedTime === undefined) {
      return res.status(400).json({ error: 'elapsedTime is required in request body' });
    }

    const game = await gameRepository.findOneBy({ id });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    game.endDate = new Date();
    game.won = 0;
    game.elapsedTime = elapsedTime;
    if (playerIcon) {
      game.playerIcon = playerIcon;
    }

    await gameRepository.save(game);
    res.status(200).json({ message: 'Game aborted successfully' });
  } catch (error) {
    console.error('Error aborting game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import { Router } from 'express';
import { MoviesController} from "../controllers/MoviesController";

const router = Router();
const moviesController = new MoviesController();

router.get('/search', moviesController.searchMovies);
router.get('/:id', moviesController.getMovieById);

export default router;
import { Request, Response } from 'express';
import { OMDbService} from "../services/OMDbService";

export class MoviesController {
    private omdbService: OMDbService;

    constructor() {
        this.omdbService = new OMDbService;
    }

    searchMovies = async (req: Request, res: Response): Promise<void> => {
        const {q, page = '1'} = req.query;
        if (!q || typeof q !== 'string') {
            res.status(400).json({message: 'Search query parameter "q" is required'});
            return;
        }
        try {
            const pageNum = parseInt(page as string);
            const results = await this.omdbService.searchMovies(q, pageNum);

            res.json({
                status: "success",
                data: results.Search || [],
                pagination: {
                    currentPage: pageNum,
                    limit: 10,
                    nextPage: results.Search && results.Search.length === 10 ? pageNum + 1 : null,
                    prevPage: pageNum > 1 ? pageNum - 1 : null
                }
            });

        } catch (error) {
            console.error('OMDb search error:', error);
            res.status(500).json({message: 'Failed to search movies'});
        }
    }

    getMovieById = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ message: 'Movie ID is required' });
            return;
        }

        try {
            const movie = await this.omdbService.getMovieById(id as string);

            if (!movie) {
                res.status(404).json({ message: 'Movie not found' });
                return;
            }

            res.json({
                status: "success",
                data: movie
            });

        } catch (error) {
            console.error('OMDb fetch error:', error);
            res.status(500).json({ message: 'Failed to fetch movie details' });
        }
    }
}
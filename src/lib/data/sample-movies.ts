import { Movie, PaginatedResponse, Episode } from '@/types';

// Sample movie data to use when API is not available
export const sampleMovies: Movie[] = [
  {
    _id: '1',
    name: 'Avengers: Endgame',
    origin_name: 'Avengers: Endgame',
    slug: 'avengers-endgame',
    thumb_url: 'https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg',
    year: 2019,
    category: {
      name: 'Movies',
      slug: 'phim-le'
    },
    country: [
      {
        name: 'USA',
        slug: 'usa'
      }
    ],
    type: 'movie',
    status: 'completed',
    episode_current: 'Full',
    quality: 'HD',
    lang: 'Vietsub',
    view: 10000000,
    genres: [
      {
        name: 'Action',
        slug: 'action'
      },
      {
        name: 'Adventure',
        slug: 'adventure'
      },
      {
        name: 'Sci-Fi',
        slug: 'sci-fi'
      }
    ],
    actors: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo', 'Chris Hemsworth', 'Scarlett Johansson'],
    directors: ['Anthony Russo', 'Joe Russo'],
    duration: '181 min',
    content: 'After the devastating events of Avengers: Infinity War (2018), the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',
    episodes: [
      {
        _id: '1',
        name: 'Full Movie',
        slug: 'full-movie',
        filename: 'avengers-endgame',
        link_embed: 'https://www.youtube.com/embed/TcMBFSGVi1c',
        link_m3u8: 'https://www.youtube.com/watch?v=TcMBFSGVi1c'
      }
    ]
  },
  {
    _id: '2',
    name: 'The Shawshank Redemption',
    origin_name: 'The Shawshank Redemption',
    slug: 'the-shawshank-redemption',
    thumb_url: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg',
    year: 1994,
    category: {
      name: 'Movies',
      slug: 'phim-le'
    },
    country: [
      {
        name: 'USA',
        slug: 'usa'
      }
    ],
    type: 'movie',
    status: 'completed',
    episode_current: 'Full',
    quality: 'HD',
    lang: 'Vietsub',
    view: 5000000,
    genres: [
      {
        name: 'Drama',
        slug: 'drama'
      }
    ],
    actors: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton'],
    directors: ['Frank Darabont'],
    duration: '142 min',
    content: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    episodes: [
      {
        _id: '2',
        name: 'Full Movie',
        slug: 'full-movie',
        filename: 'shawshank-redemption',
        link_embed: 'https://www.youtube.com/embed/6hB3S9bIaco',
        link_m3u8: 'https://www.youtube.com/watch?v=6hB3S9bIaco'
      }
    ]
  },
  {
    _id: '3',
    name: 'The Dark Knight',
    origin_name: 'The Dark Knight',
    slug: 'the-dark-knight',
    thumb_url: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg',
    year: 2008,
    category: {
      name: 'Movies',
      slug: 'phim-le'
    },
    country: [
      {
        name: 'USA',
        slug: 'usa'
      }
    ],
    type: 'movie',
    status: 'completed',
    episode_current: 'Full',
    quality: 'HD',
    lang: 'Vietsub',
    view: 8000000,
    genres: [
      {
        name: 'Action',
        slug: 'action'
      },
      {
        name: 'Crime',
        slug: 'crime'
      },
      {
        name: 'Drama',
        slug: 'drama'
      }
    ],
    actors: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
    directors: ['Christopher Nolan'],
    duration: '152 min',
    content: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    episodes: [
      {
        _id: '3',
        name: 'Full Movie',
        slug: 'full-movie',
        filename: 'dark-knight',
        link_embed: 'https://www.youtube.com/embed/EXeTwQWrcwY',
        link_m3u8: 'https://www.youtube.com/watch?v=EXeTwQWrcwY'
      }
    ]
  },
  {
    _id: '4',
    name: 'Inception',
    origin_name: 'Inception',
    slug: 'inception',
    thumb_url: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg',
    year: 2010,
    category: {
      name: 'Movies',
      slug: 'phim-le'
    },
    country: [
      {
        name: 'USA',
        slug: 'usa'
      }
    ],
    type: 'movie',
    status: 'completed',
    episode_current: 'Full',
    quality: 'HD',
    lang: 'Vietsub',
    view: 7000000,
    genres: [
      {
        name: 'Action',
        slug: 'action'
      },
      {
        name: 'Adventure',
        slug: 'adventure'
      },
      {
        name: 'Sci-Fi',
        slug: 'sci-fi'
      }
    ],
    actors: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'],
    directors: ['Christopher Nolan'],
    duration: '148 min',
    content: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    episodes: [
      {
        _id: '4',
        name: 'Full Movie',
        slug: 'full-movie',
        filename: 'inception',
        link_embed: 'https://www.youtube.com/embed/YoHD9XEInc0',
        link_m3u8: 'https://www.youtube.com/watch?v=YoHD9XEInc0'
      }
    ]
  },
  {
    _id: '5',
    name: 'Stranger Things',
    origin_name: 'Stranger Things',
    slug: 'stranger-things',
    thumb_url: 'https://m.media-amazon.com/images/M/MV5BMDZkYmVhNjMtNWU4MC00MDQxLWE3MjYtZGMzZWI1ZjhlOWJmXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BMDZkYmVhNjMtNWU4MC00MDQxLWE3MjYtZGMzZWI1ZjhlOWJmXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg',
    year: 2016,
    category: {
      name: 'TV Series',
      slug: 'phim-bo'
    },
    country: [
      {
        name: 'USA',
        slug: 'usa'
      }
    ],
    type: 'series',
    status: 'ongoing',
    episode_current: 'Season 4',
    quality: 'HD',
    lang: 'Vietsub',
    view: 9000000,
    genres: [
      {
        name: 'Drama',
        slug: 'drama'
      },
      {
        name: 'Fantasy',
        slug: 'fantasy'
      },
      {
        name: 'Horror',
        slug: 'horror'
      }
    ],
    actors: ['Millie Bobby Brown', 'Finn Wolfhard', 'Winona Ryder'],
    directors: ['The Duffer Brothers'],
    duration: '51 min/episode',
    content: 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.',
    episodes: [
      {
        _id: '5-1',
        name: 'Episode 1',
        slug: 'episode-1',
        filename: 'stranger-things-s1e1',
        link_embed: 'https://www.youtube.com/embed/b9EkMc79ZSU',
        link_m3u8: 'https://www.youtube.com/watch?v=b9EkMc79ZSU'
      },
      {
        _id: '5-2',
        name: 'Episode 2',
        slug: 'episode-2',
        filename: 'stranger-things-s1e2',
        link_embed: 'https://www.youtube.com/embed/R1ZXOOLMJ8s',
        link_m3u8: 'https://www.youtube.com/watch?v=R1ZXOOLMJ8s'
      },
      {
        _id: '5-3',
        name: 'Episode 3',
        slug: 'episode-3',
        filename: 'stranger-things-s1e3',
        link_embed: 'https://www.youtube.com/embed/x6pXA6IysfE',
        link_m3u8: 'https://www.youtube.com/watch?v=x6pXA6IysfE'
      }
    ]
  },
  {
    _id: '6',
    name: 'Your Name',
    origin_name: 'Kimi no Na wa',
    slug: 'your-name',
    thumb_url: 'https://m.media-amazon.com/images/M/MV5BODRmZDVmNzUtZDA4ZC00NjhkLWI2M2UtN2M0ZDIzNDcxYThjL2ltYWdlXkEyXkFqcGdeQXVyNTk0MzMzODA@._V1_.jpg',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BODRmZDVmNzUtZDA4ZC00NjhkLWI2M2UtN2M0ZDIzNDcxYThjL2ltYWdlXkEyXkFqcGdeQXVyNTk0MzMzODA@._V1_.jpg',
    year: 2016,
    category: {
      name: 'Anime',
      slug: 'hoat-hinh'
    },
    country: [
      {
        name: 'Japan',
        slug: 'japan'
      }
    ],
    type: 'movie',
    status: 'completed',
    episode_current: 'Full',
    quality: 'HD',
    lang: 'Vietsub',
    view: 6000000,
    genres: [
      {
        name: 'Animation',
        slug: 'animation'
      },
      {
        name: 'Drama',
        slug: 'drama'
      },
      {
        name: 'Fantasy',
        slug: 'fantasy'
      }
    ],
    actors: ['Ryunosuke Kamiki', 'Mone Kamishiraishi'],
    directors: ['Makoto Shinkai'],
    duration: '106 min',
    content: 'Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?',
    episodes: [
      {
        _id: '6',
        name: 'Full Movie',
        slug: 'full-movie',
        filename: 'your-name',
        link_embed: 'https://www.youtube.com/embed/xU47nhruN-Q',
        link_m3u8: 'https://www.youtube.com/watch?v=xU47nhruN-Q'
      }
    ]
  }
];

// Function to get paginated sample movies
export function getSampleMovies(page: number = 1, itemsPerPage: number = 10): PaginatedResponse<Movie> {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMovies = sampleMovies.slice(startIndex, endIndex);

  return {
    data: paginatedMovies,
    pagination: {
      totalItems: sampleMovies.length,
      totalItemsPerPage: itemsPerPage,
      currentPage: page,
      totalPages: Math.ceil(sampleMovies.length / itemsPerPage)
    }
  };
}

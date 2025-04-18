import { Movie, PaginatedResponse } from '@/types/movie';

// Mock data for testing search functionality
export const mockMovies: Movie[] = [
  {
    id: '1',
    name: 'Avatar',
    origin_name: 'Avatar',
    slug: 'avatar',
    year: 2009,
    thumb_url: 'https://m.media-amazon.com/images/M/MV5BNjA3NGExZDktNDlhZC00NjYyLTgwNmUtZWUzMDYwMTZjZWUyXkEyXkFqcGdeQXVyMTU1MDM3NDk0._V1_.jpg',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BNjA3NGExZDktNDlhZC00NjYyLTgwNmUtZWUzMDYwMTZjZWUyXkEyXkFqcGdeQXVyMTU1MDM3NDk0._V1_.jpg',
    content: 'A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.',
    type: 'movie',
    status: 'completed',
    is_copyright: false,
    sub_docquyen: false,
    chieurap: false,
    trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
    time: '162 phút',
    episode_current: 'Full',
    episode_total: '1',
    quality: 'HD',
    lang: 'Vietsub',
    notify: '',
    showtimes: '',
    view: 1000000,
    category: [
      { id: '1', name: 'Hành Động', slug: 'hanh-dong' },
      { id: '2', name: 'Viễn Tưởng', slug: 'vien-tuong' },
      { id: '3', name: 'Phiêu Lưu', slug: 'phieu-luu' }
    ],
    country: [
      { id: '1', name: 'Mỹ', slug: 'my' }
    ],
    actor: [
      'Sam Worthington',
      'Zoe Saldana',
      'Sigourney Weaver'
    ],
    director: [
      'James Cameron'
    ]
  },
  {
    id: '2',
    name: 'Avatar: The Way of Water',
    origin_name: 'Avatar: The Way of Water',
    slug: 'avatar-the-way-of-water',
    year: 2022,
    thumb_url: 'https://m.media-amazon.com/images/M/MV5BYjhiNjBlODctY2ZiOC00YjVlLWFlNzAtNTVhNzM1YjI1NzMxXkEyXkFqcGdeQXVyMjQxNTE1MDA@._V1_.jpg',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BYjhiNjBlODctY2ZiOC00YjVlLWFlNzAtNTVhNzM1YjI1NzMxXkEyXkFqcGdeQXVyMjQxNTE1MDA@._V1_.jpg',
    content: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
    type: 'movie',
    status: 'completed',
    is_copyright: false,
    sub_docquyen: false,
    chieurap: true,
    trailer_url: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
    time: '192 phút',
    episode_current: 'Full',
    episode_total: '1',
    quality: 'HD',
    lang: 'Vietsub',
    notify: '',
    showtimes: '',
    view: 800000,
    category: [
      { id: '1', name: 'Hành Động', slug: 'hanh-dong' },
      { id: '2', name: 'Viễn Tưởng', slug: 'vien-tuong' },
      { id: '3', name: 'Phiêu Lưu', slug: 'phieu-luu' }
    ],
    country: [
      { id: '1', name: 'Mỹ', slug: 'my' }
    ],
    actor: [
      'Sam Worthington',
      'Zoe Saldana',
      'Sigourney Weaver',
      'Kate Winslet'
    ],
    director: [
      'James Cameron'
    ]
  },
  {
    id: '3',
    name: 'The Last Airbender',
    origin_name: 'The Last Airbender',
    slug: 'the-last-airbender',
    year: 2010,
    thumb_url: 'https://m.media-amazon.com/images/M/MV5BMTM1NjE0NDA0MV5BMl5BanBnXkFtZTcwODE4NDg1Mw@@._V1_.jpg',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BMTM1NjE0NDA0MV5BMl5BanBnXkFtZTcwODE4NDg1Mw@@._V1_.jpg',
    content: 'Follows the adventures of Aang, a young successor to a long line of Avatars, who must master all four elements and stop the Fire Nation from enslaving the Water Tribes and the Earth Kingdom.',
    type: 'movie',
    status: 'completed',
    is_copyright: false,
    sub_docquyen: false,
    chieurap: false,
    trailer_url: 'https://www.youtube.com/watch?v=e0ViKyWsVtU',
    time: '103 phút',
    episode_current: 'Full',
    episode_total: '1',
    quality: 'HD',
    lang: 'Vietsub',
    notify: '',
    showtimes: '',
    view: 500000,
    category: [
      { id: '1', name: 'Hành Động', slug: 'hanh-dong' },
      { id: '2', name: 'Viễn Tưởng', slug: 'vien-tuong' },
      { id: '3', name: 'Phiêu Lưu', slug: 'phieu-luu' }
    ],
    country: [
      { id: '1', name: 'Mỹ', slug: 'my' }
    ],
    actor: [
      'Noah Ringer',
      'Dev Patel',
      'Nicola Peltz'
    ],
    director: [
      'M. Night Shyamalan'
    ]
  },
  {
    id: '4',
    name: 'Lục Địa Huyền Bí',
    origin_name: 'The Lost Continent',
    slug: 'luc-dia-huyen-bi',
    year: 1968,
    thumb_url: 'https://m.media-amazon.com/images/M/MV5BZTFkZjYxNWItZmE2MC00MGE4LWIxYTgtZmIzOWM1YmVkYjc0XkEyXkFqcGdeQXVyMDUyOTUyNQ@@._V1_.jpg',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BZTFkZjYxNWItZmE2MC00MGE4LWIxYTgtZmIzOWM1YmVkYjc0XkEyXkFqcGdeQXVyMDUyOTUyNQ@@._V1_.jpg',
    content: 'A ship\'s crew gets stranded on an island inhabited by dinosaurs and other dangers.',
    type: 'movie',
    status: 'completed',
    is_copyright: false,
    sub_docquyen: false,
    chieurap: false,
    trailer_url: '',
    time: '91 phút',
    episode_current: 'Full',
    episode_total: '1',
    quality: 'HD',
    lang: 'Vietsub',
    notify: '',
    showtimes: '',
    view: 100000,
    category: [
      { id: '2', name: 'Viễn Tưởng', slug: 'vien-tuong' },
      { id: '3', name: 'Phiêu Lưu', slug: 'phieu-luu' }
    ],
    country: [
      { id: '1', name: 'Mỹ', slug: 'my' }
    ],
    actor: [
      'Eric Porter',
      'Hildegard Knef',
      'Suzanna Leigh'
    ],
    director: [
      'Michael Carreras'
    ]
  },
  {
    id: '5',
    name: 'Lục Địa Đen',
    origin_name: 'Black Earth Rising',
    slug: 'luc-dia-den',
    year: 2018,
    thumb_url: 'https://m.media-amazon.com/images/M/MV5BMGE1ZGJlMDAtZTNmYy00MGEyLWJmOWUtMjc5ZWZlZDU2M2I1XkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
    poster_url: 'https://m.media-amazon.com/images/M/MV5BMGE1ZGJlMDAtZTNmYy00MGEyLWJmOWUtMjc5ZWZlZDU2M2I1XkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
    content: 'Kate is a survivor of the Rwandan genocide whose adoptive mother, an international lawyer, faces a case that will shake their lives.',
    type: 'series',
    status: 'completed',
    is_copyright: false,
    sub_docquyen: false,
    chieurap: false,
    trailer_url: '',
    time: '60 phút/tập',
    episode_current: '8',
    episode_total: '8',
    quality: 'HD',
    lang: 'Vietsub',
    notify: '',
    showtimes: '',
    view: 200000,
    category: [
      { id: '4', name: 'Chính Kịch', slug: 'chinh-kich' },
      { id: '5', name: 'Hình Sự', slug: 'hinh-su' }
    ],
    country: [
      { id: '2', name: 'Anh', slug: 'anh' }
    ],
    actor: [
      'Michaela Coel',
      'John Goodman',
      'Harriet Walter'
    ],
    director: [
      'Hugo Blick'
    ]
  }
];

// Mock search function
export function mockSearchMovies(keyword: string, page: number = 1, limit: number = 20): PaginatedResponse<Movie> {
  const filteredMovies = mockMovies.filter(movie => 
    movie.name.toLowerCase().includes(keyword.toLowerCase()) || 
    movie.origin_name.toLowerCase().includes(keyword.toLowerCase())
  );
  
  const totalItems = filteredMovies.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedMovies = filteredMovies.slice(startIndex, endIndex);
  
  return {
    data: paginatedMovies,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
}

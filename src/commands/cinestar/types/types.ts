export interface Cinema {
  name: string;
  file_id: string;
  area_id: string;
  order_id: string;
  server_id: string;
  image: string;
  cinema_id: string;
  address: string;
  map_url: string;
}

export interface MovieSchedule {
  date?: string;
  times?: MovieShowtime[];
}

export interface MovieShowtime {
  time?: string;
  showtime_id?: string;
}

export interface CinemaMovie {
  id?: string | number;
  name_vn?: string;
  image?: string;
  type_name_vn?: string;
  time_m?: number | string;
  country_name_vn?: string;
  language_vn?: string;
  brief_vn?: string;
  trailer?: string;
  schedule?: MovieSchedule[];
}

export interface CachedMovie {
  title: string;
  date: string;
  showtimes: string[];
  image: string;
  bookingUrl: string;
  genre: string;
  duration: number | string;
  country: string;
  language: string;
  brief: string;
  trailer: string | null;
}

export interface ComingMovie {
  name_vn?: string;
  release_date?: string;
  time?: number | string;
  type_name_vn?: string;
  brief_vn?: string;
  image?: string;
  trailer?: string;
}

export interface CinestarHomeResponse {
  pageProps?: {
    res?: {
      listMovie?: { id?: string | number }[];
      listComingMovie?: ComingMovie[];
    };
  };
}

export interface ShowtimesResponse {
  data?: CinemaMovie[];
}

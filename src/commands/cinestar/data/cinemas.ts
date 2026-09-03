import type { Cinema } from '../types/types.ts';

export const CINEMAS: Record<string, Cinema> = {
  'Cinestar Hiệp Phú - TP.HCM': {
    name: 'Cinestar Hiệp Phú - TP.HCM',
    file_id: 'hp',
    area_id: '44eb9a3b-a1fb-45a4-898e-1c0ae39e84dc',
    order_id: '0',
    server_id: '11',
    image:
      'https://api-website.cinestar.com.vn/media/wysiwyg/CinemaImage/C12_banner_web_2400_x_987px.png',
    cinema_id: '7095da31-3c05-4bc5-bc28-fef354d9c1f2',
    address:
      'Trung tâm MM Mega Market Hiệp Phú, số 2 đường Trương Thị Hoa, Khu phố 3, Phường Tân Thới Hiệp, Thành phố Hồ Chí Minh, Việt Nam',
    map_url: 'https://maps.app.goo.gl/sGDxzwMjztkbQynn7',
  },

  'Cinestar Quốc Thanh - TP.HCM': {
    name: 'Cinestar Quốc Thanh - TP.HCM',
    file_id: 'qt',
    area_id: '44eb9a3b-a1fb-45a4-898e-1c0ae39e84dc',
    order_id: '1',
    server_id: '1',
    image:
      'https://api-website.cinestar.com.vn/media/wysiwyg/CinemaImage/01-Quoc-Thanh-masthead.jpg',
    cinema_id: '8f3a5832-8340-4a43-89bc-6653817162f1',
    address: '271 Nguyễn Trãi, Phường Cầu Ông Lãnh, Thành Phố Hồ Chí Minh, Việt Nam',
    map_url: 'https://maps.app.goo.gl/W8YmfGB8SSgy9A8V6',
  },

  'Cinestar Parkcity - Hà Nội': {
    name: 'Cinestar Parkcity - Hà Nội',
    file_id: 'pc',
    area_id: '71470f61-0c2e-4dc6-ba2d-3a2064df950e',
    order_id: '16',
    server_id: '10',
    image: 'https://api-website.cinestar.com.vn/media/wysiwyg/CinemaImage/10-parlcity.jpg',
    cinema_id: '85e300f7-6aa7-48bc-b29f-405255918bba',
    address:
      'Tầng 3TTTM The LinC, Khu đô thị ParkCity Hà Nội, 165 Lê Trọng Tấn, P. Dương Nội, Hà Nội',
    map_url: 'https://maps.app.goo.gl/seXNaiuS6NZonjsM9',
  },

  'Cinestar Sinh Viên - TP.HCM': {
    name: 'Cinestar Sinh Viên - TP.HCM',
    file_id: 'sv',
    area_id: 'e2c7d28c-2f95-444d-b9ff-aa6684af4ad8',
    order_id: '3',
    server_id: '4',
    image:
      'https://api-website.cinestar.com.vn/media/wysiwyg/CinemaImage/05_sinh_vien_masthead.jpg',
    cinema_id: 'cf13e1ce-2c1f-4c73-8ce5-7ef65472db3c',
    address: 'Nhà văn hóa sinh viên - Khu đô thị Đại học Quốc gia HCM, P. Đông Hòa, TP. HCM',
    map_url: 'https://maps.app.goo.gl/FAzBTBxwqQAxKnaH6',
  },

  'Cinestar Huế - TP.Huế': {
    name: 'Cinestar Huế - TP.Huế',
    file_id: 'hue',
    area_id: '3a10a529-c2e3-4d88-8ad5-f3d653849c0d',
    order_id: '4',
    server_id: '5',
    image: 'https://api-website.cinestar.com.vn/media/wysiwyg/CinemaImage/04_Hue_masthead.jpg',
    cinema_id: 'f8a60463-5c34-49a9-9ae8-52081e387bb8',
    address: '25 Hai Bà Trưng, Phường Thuận Hoá, TP. Huế',
    map_url: 'https://maps.app.goo.gl/dHSwzFYxHbfnoGLh8',
  },

  'Cinestar Đà Lạt - Lâm Đồng': {
    name: 'Cinestar Đà Lạt - Lâm Đồng',
    file_id: 'dalat',
    area_id: '506018c7-c3a6-4113-9112-01cbad73d0a7',
    order_id: '5',
    server_id: '2',
    image: 'https://api-website.cinestar.com.vn/media/wysiwyg/CinemaImage/02-Da_Lat_masthead.jpg',
    cinema_id: 'e08f986a-1937-419e-b1b1-759b7c74728b',
    address: 'Quảng trường Lâm Viên, Phường Xuân Hương - Đà Lạt, tỉnh Lâm Đồng',
    map_url: 'https://maps.app.goo.gl/sYAgq34E14rGHfux6',
  },

  'Cinestar Lâm Đồng - Đức Trọng': {
    name: 'Cinestar Lâm Đồng - Đức Trọng',
    file_id: 'ld',
    area_id: '55e2182d-e5b8-4b74-b791-abf55f770b67',
    order_id: '6',
    server_id: '8',
    image: 'https://api-website.cinestar.com.vn/media/wysiwyg/CinemaImage/08_Lam_Dong_masthead.jpg',
    cinema_id: '104509be-034e-47c1-bf1b-aba7f2df4f28',
    address:
      'Tầng 4, Trung tâm Thương mại và Dịch vụ tài chính Sacombank, 713 Quốc lộ 20, Xã Đức Trọng, Tỉnh Lâm Đồng',
    map_url: 'https://maps.app.goo.gl/SyJnZcKU8Egngniq7',
  },

  'Cinestar Mỹ Tho - Đồng Tháp': {
    name: 'Cinestar Mỹ Tho - Đồng Tháp',
    file_id: 'mt',
    area_id: 'b27fe633-a4a1-4df4-81e2-23b3da44f7ec',
    order_id: '7',
    server_id: '6',
    image: 'https://cinestar-api.monamedia.net/media/wysiwyg/CinemaImage/06_My_Tho_masthead.jpg',
    cinema_id: '8f54df74-3796-42ea-896e-cd638eec1fe3',
    address: '52 Đinh Bộ Lĩnh, Phường Mỹ Tho, tỉnh Đồng Tháp',
    map_url: 'https://maps.app.goo.gl/vtxJ7BPnCpghr7sr5',
  },

  'Cinestar Kiên Giang - An Giang': {
    name: 'Cinestar Kiên Giang - An Giang',
    file_id: 'kg',
    area_id: '18b96581-f9e9-4216-97b4-78b49c54d5c5',
    order_id: '8',
    server_id: '7',
    image:
      'https://cinestar-api.monamedia.net/media/wysiwyg/CinemaImage/07_Kien_Giang_masthead.jpg',
    cinema_id: '4a51b9ee-f143-4411-9dbb-5f54a1c382c0',
    address: 'TTTM Rạch Sỏi, phường Rạch Giá, tỉnh An Giang',
    map_url: 'https://maps.app.goo.gl/PNxcAXq6QVZL5Tdp6',
  },

  'Cinestar Satra Quận 6 - TP.HCM': {
    name: 'Cinestar Satra Quận 6 - TP.HCM',
    file_id: 'satra',
    area_id: '44eb9a3b-a1fb-45a4-898e-1c0ae39e84dc',
    order_id: '9',
    server_id: '9',
    image: 'https://admin.cinestar.com.vn/Areas/Admin/Content/Fileuploads/images/LOGO/SATRAQ6.png',
    cinema_id: '42bec658-2331-4dc7-ac03-39231c069d7e',
    address: 'Tầng 6, TTTM Centre Mall, 1466 Võ Văn Kiệt, Phường Bình Tiên, TP. HCM',
    map_url: 'https://maps.app.goo.gl/3yNvWHVjgZoRFFyv5',
  },
};

export function getCinema(name: string): Cinema | undefined {
  return CINEMAS[name];
}

export function getCinemaByFileId(file_id: string): Cinema | undefined {
  return Object.values(CINEMAS).find((cinema) => cinema.file_id === file_id);
}

export function getToday() {
  const today = new Date();
  const todayVNTime = new Date(today.toLocaleString('en-US', { 
    timeZone: 'Asia/Ho_Chi_Minh' 
  }));
  
  const day = String(todayVNTime.getDate()).padStart(2, '0');
  const month = String(todayVNTime.getMonth() + 1).padStart(2, '0');
  const year = todayVNTime.getFullYear();

  return `${year}-${month}-${day}`; // 2026-03-21
}
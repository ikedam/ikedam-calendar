(() => {
  let holidays = undefined;
  let markHolidays = () => {
    if (!holidays) {
      return;
    }
    document.querySelectorAll('.cells.days>div').forEach((e) => {
      let d = e.innerText;
      if (!d) {
        return;
      }
      d = '2023-03-' + d.padStart(2, '0');
      if (holidays[d]) {
        e.classList.add('holiday');
      }
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    const req = new XMLHttpRequest();
    req.withCredentials = false;
    req.addEventListener('load', () => {
      holidays = JSON.parse(req.responseText);
      markHolidays();
    });
    req.open('GET', 'https://holidays-jp.github.io/api/v1/date.json');
    req.send();
  });
})();

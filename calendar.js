(() => {
  const holidayURL = 'https://holidays-jp.github.io/api/v1/date.json';
  const imagesURL = 'https://www.ikedam.jp/dl/1day1pict/json.cgi/image.json';

  let today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 1;
  let holidays = undefined;
  let images = undefined;
  let currentImage = undefined;

  let markHolidays = () => {
    if (!holidays) {
      return;
    }
    document.querySelectorAll('.cells.days>div').forEach((e) => {
      let d = e.innerText;
      if (!d) {
        return;
      }
      d = `${year}-${String(month).padStart(2, '0')}-${d.padStart(2, '0')}`;
      if (holidays[d]) {
        e.classList.add('holiday');
      }
    });
  };

  let setupDays = () => {
    document.getElementById('month').innerText = `${month}月`;
    window.location.hash = `#${year}-${String(month).padStart(2, '0')}`;

    const firstDate = new Date(year, month - 1, 1);
    const lastDate = new Date(year, month - 1, 1);
    lastDate.setMonth(month);
    lastDate.setDate(0);

    const dayNum = lastDate.getDate();
    const firstWeekday = firstDate.getDay();
    const lastWeekday = lastDate.getDay();

    const dayList = [];
    for (let i = 0; i < firstWeekday; ++i) {
      dayList.push('');
    }
    for (let i = 1; i <= dayNum; ++i) {
      dayList.push(String(i));
    }
    for (let i = lastWeekday; i < 6; ++i) {
      dayList.push('');
    }
    const dayContainer = document.getElementById('days');
    while(dayContainer.lastChild) {
      dayContainer.removeChild(dayContainer.lastChild);
    }
    for (const day of dayList) {
      const dayElement = document.createElement('div');
      dayElement.innerText = day;
      dayContainer.appendChild(dayElement);
    }
    shuffleImage();
    markHolidays();
  };

  const hashRE = new RegExp('^#(\\d{4})-(\\d{2})$');
  const reflectHash = () => {
    const monthMatch = hashRE.exec(window.location.hash);
    if (!monthMatch) {
      return false;
    }
    const newYear = Number(monthMatch[1]);
    const newMonth = Number(monthMatch[2]);
    if (newYear === year && newMonth === month) {
      return false;
    }
    year = newYear;
    month = newMonth;
    return true;
  };

  const decideImage = () => {
    if (window.location.search && window.location.search.startsWith('?')) {
      try {
        const image = decodeURIComponent(window.location.search.substring(1));
        if (images.includes(image)) {
          return image;
        }
      } catch (_) {
      }
    }
    const idx = Math.floor(Math.random() * images.length);
    return images[idx];
  }

  const shuffleImage = () => {
    if (!images) {
      return;
    }
    const image = decideImage();
    if (image === currentImage) {
      return;
    }
    currentImage = image;
    const url = new URL(currentImage, imagesURL);
    document.getElementById('calendar').style.backgroundImage = `url(${url.href})`
  };

  const loadHolidays = () => {
    const req = new XMLHttpRequest();
    req.withCredentials = false;
    req.addEventListener('load', () => {
      holidays = JSON.parse(req.responseText);
      markHolidays();
    });
    req.open('GET', holidayURL);
    req.send();
  };

  const loadImages = () => {
    const req = new XMLHttpRequest();
    req.withCredentials = false;
    req.addEventListener('load', () => {
      images = JSON.parse(req.responseText);
      shuffleImage();
    });
    req.open('GET', imagesURL);
    req.send();
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('prior').addEventListener('click', () => {
      month = month - 1;
      while (month <= 0) {
        year = year - 1;
        month = month + 12;
      }
      setupDays();
    });
    document.getElementById('next').addEventListener('click', () => {
      month = month + 1;
      while (month > 12) {
        year = year + 1;
        month = month - 12;
      }
      setupDays();
    });
    document.getElementById('shuffle').addEventListener('click', () => {
      if (window.location.search) {
        const url = new URL(window.location);
        url.search = '';
        window.history.pushState({}, '', url);
      }
      shuffleImage();
    });
    document.getElementById('link').addEventListener('click', () => {
      if (!currentImage) {
        return;
      }
      const url = new URL(window.location);
      url.search = '?' + encodeURIComponent(currentImage);
      if (window.location.href !== url.href) {
        window.history.pushState({}, '', url);
      }
      navigator.clipboard.writeText(url.href);
    });
    window.addEventListener('hashchange', () => {
      if (reflectHash()) {
        setupDays();
      }
    });
    window.addEventListener('popstate', () => {
      if (reflectHash()) {
        setupDays();
      } else {
        shuffleImage();
      }
    });
    reflectHash();
    setupDays();
    loadHolidays();
    loadImages();
  });
})();

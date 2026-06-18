document.addEventListener('DOMContentLoaded', function () {
  initMobileNavigation();
  initHeroSlider();
  initVideoPlayers();
  initSearchPage();
});

function initMobileNavigation() {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener('click', function () {
    nav.classList.toggle('is-open');
  });
}

function initHeroSlider() {
  var slider = document.querySelector('[data-hero-slider]');

  if (!slider) {
    return;
  }

  var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = Number(dot.getAttribute('data-hero-dot')) || 0;
      showSlide(index);
      start();
    });
  });

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);

  showSlide(0);
  start();
}

function initVideoPlayers() {
  var videos = Array.prototype.slice.call(document.querySelectorAll('video[data-hls-src]'));

  videos.forEach(function (video) {
    var source = video.getAttribute('data-hls-src');
    var shell = video.closest('.video-shell');
    var playButton = shell ? shell.querySelector('[data-video-play]') : null;
    var hlsInstance = null;

    if (!source) {
      if (playButton) {
        playButton.querySelector('strong').textContent = '暂无播放源';
      }
      return;
    }

    function attachSource() {
      if (video.getAttribute('data-hls-ready') === 'true') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      video.setAttribute('data-hls-ready', 'true');
    }

    function playVideo() {
      attachSource();
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    attachSource();

    if (playButton) {
      playButton.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (playButton && video.currentTime === 0) {
        playButton.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}

function initSearchPage() {
  var root = document.querySelector('[data-search-page]');

  if (!root) {
    return;
  }

  var form = root.querySelector('[data-search-form]');
  var summary = root.querySelector('[data-search-summary]');
  var results = root.querySelector('[data-search-results]');
  var movies = [];

  fetch('assets/movies.json')
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      movies = data;
      renderResults(movies.slice(0, 60), movies.length, '默认展示前 60 条影片，可输入关键词继续筛选。');
    })
    .catch(function () {
      summary.textContent = '影片索引载入失败，请直接通过分类页浏览影片。';
    });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    applyFilters();
  });

  form.addEventListener('input', function () {
    applyFilters();
  });

  function applyFilters() {
    var data = new FormData(form);
    var keyword = normalize(data.get('q'));
    var category = data.get('category');
    var region = data.get('region');
    var type = data.get('type');
    var year = data.get('year');

    var filtered = movies.filter(function (movie) {
      var text = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags.join(' '),
        movie.oneLine
      ].join(' '));

      return (!keyword || text.indexOf(keyword) !== -1)
        && (!category || movie.categorySlug === category)
        && (!region || movie.region === region)
        && (!type || movie.type === type)
        && (!year || String(movie.year) === String(year));
    });

    renderResults(filtered.slice(0, 120), filtered.length, '最多显示前 120 条匹配结果。');
  }

  function renderResults(items, total, note) {
    summary.textContent = '找到 ' + total + ' 条影片。' + note;

    if (!items.length) {
      results.innerHTML = '<p class="movie-meta">没有匹配结果，请调整关键词或筛选条件。</p>';
      return;
    }

    results.innerHTML = items.map(function (movie) {
      return [
        '<article class="movie-card">',
        '  <a class="movie-cover-link" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="movie-year">' + escapeHtml(movie.year) + '</span>',
        '    <span class="movie-overlay">' + escapeHtml(movie.oneLine) + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
        '    <span class="genre-pill">' + escapeHtml(movie.genre) + '</span>',
        '  </div>',
        '</article>'
      ].join('\n');
    }).join('\n');
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// --- Переменные формы расчета ---
const fromInput = document.getElementById("from");
const toInput = document.getElementById("to");
const calcButton = document.getElementById("calc");
const submitButton = document.getElementById("submit");

// --- Элементы в блоке результатов ---
const distanceValue = document.getElementById("distanceValue");
const durationValue = document.getElementById("durationValue");
const rateValue = document.getElementById("rateValue");
const totalValue = document.getElementById("totalValue");
const resultBlock = document.getElementById("result");

// --- Элементы карточек размеров и СКОРОСТИ ---
const sizes = document.querySelectorAll(".main-size-card");
const speeds = document.querySelectorAll(".main-speed-card"); // Новое

// --- Глобальные переменные Google Maps ---
let map;
let mapRoute;
let currentDistanceKm = 0;

const RATES = { xs: 9, s: 13, m: 20, l: 27, xl: 35, max: 70 };
const MIN_BY_SIZE = { xs: 149, s: 199, m: 249, l: 349, xl: 499, max: 999 };

// Коэффициенты скорости (Новое)
const SPEED_MULTIPLIERS = {
  regular: 1,
  fast: 1.5, // Приоритетная доставка дороже на 50%
};

function initMap() {
  const centerPosition = { lat: 52.535591, lng: 13.411012 };
  map = new google.maps.Map(document.getElementById("map"), {
    center: centerPosition,
    zoom: 13,
    disableDefaultUI: true,
    zoomControl: true,
  });
  console.log("Карта инициализирована");
  initUI();
}

function initUI() {
  new google.maps.places.Autocomplete(fromInput);
  new google.maps.places.Autocomplete(toInput);

  // Логика выбора РАЗМЕРА
  sizes.forEach((card) => {
    card.addEventListener("click", () => {
      sizes.forEach((s) => s.classList.remove("is-active"));
      card.classList.add("is-active");
      if (currentDistanceKm > 0) updatePriceDisplay(currentDistanceKm);
    });
  });

  // Логика выбора СКОРОСТИ (Новое)
  speeds.forEach((card) => {
    card.addEventListener("click", () => {
      speeds.forEach((s) => s.classList.remove("is-active"));
      card.classList.add("is-active");

      // Если маршрут уже рассчитан, цена обновится сразу при клике на скорость
      if (currentDistanceKm > 0) updatePriceDisplay(currentDistanceKm);
    });
  });

  const checkFields = () => {
    calcButton.disabled = !(fromInput.value.trim() && toInput.value.trim());
  };
  fromInput.addEventListener("input", checkFields);
  toInput.addEventListener("input", checkFields);
}

function updatePriceDisplay(km) {
  // Получаем выбранный размер
  const activeSize = document.querySelector(".main-size-card.is-active").dataset
    .value;
  // Получаем выбранную скорость (Новое)
  const activeSpeed = document.querySelector(".main-speed-card.is-active")
    .dataset.value;

  const rate = RATES[activeSize];
  const minPrice = MIN_BY_SIZE[activeSize];
  const speedMultiplier = SPEED_MULTIPLIERS[activeSpeed]; // Коэффициент скорости

  // Расчет: (Км * Тариф) * Коэффициент скорости
  let finalPrice = Math.round(km * rate * speedMultiplier);

  // Проверка на минимальную стоимость
  if (finalPrice < minPrice) finalPrice = minPrice;

  distanceValue.innerText = `${Math.round(km)} км`;
  rateValue.innerText = `${rate} ₽/км`;
  totalValue.innerText = `${finalPrice} ₽`;

  resultBlock.style.opacity = "1";
  submitButton.disabled = false;
}

// Обработка клика по "Рассчитать" (без изменений)
calcButton.addEventListener("click", () => {
  const directionsService = new google.maps.DirectionsService();
  if (mapRoute) mapRoute.setMap(null);
  mapRoute = new google.maps.DirectionsRenderer();
  mapRoute.setMap(map);

  const request = {
    origin: fromInput.value,
    destination: toInput.value,
    travelMode: "DRIVING",
  };

  directionsService.route(request, (result, status) => {
    if (status === "OK") {
      mapRoute.setDirections(result);
      const leg = result.routes[0].legs[0];
      currentDistanceKm = leg.distance.value / 1000;
      durationValue.innerText = leg.duration.text;
      updatePriceDisplay(currentDistanceKm);
    } else {
      alert("Ошибка при расчете маршрута: " + status);
    }
  });
});

window.initMap = initMap;

// Логика отправки (без изменений)
submitButton.addEventListener("click", function () {
  const name = document.getElementById("customerName").value;
  const phone = document.getElementById("customerPhone").value;
  if (!name || !phone) {
    alert("Заполните имя и телефон!");
    return;
  }
  const form = document.getElementById("orderForm");
  const success = document.getElementById("orderSuccess");
  if (form && success) {
    form.style.display = "none";
    success.style.display = "flex";
    success.classList.add("is-visible");
    const idElem = document.getElementById("orderId");
    if (idElem) idElem.innerText = Math.floor(10000 + Math.random() * 90000);
  }
});

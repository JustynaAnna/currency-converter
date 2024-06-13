const baseCurrencySelect = document.querySelector("#base-currency");
const baseAmountInput = document.querySelector(".amount-input");
const targetCurrencySelect = document.querySelector("#target-currency");
const targetAmountInput = document.querySelector(".target-amount-input");
const convertBtn = document.querySelector(".convert");
const swapBtn = document.querySelector(".swap");
const exchangeRateInfo = document.querySelector(".exchange-rate-info");
const baseFlagsBox = document.querySelector(".base-flags-box");
const targetfetchFlagSvgBox = document.querySelector(".target-flags-box");
const errorMessage = document.querySelector(".error-message");
const apiKey = "ae187835fa5da279b910fcd0";

console.log(targetAmountInput.value); //Dlaczego drukuje się nic?
const fetchExchangeRates = async () => {
  const baseCurrency = baseCurrencySelect.value || "PLN";
  const targetCurrency = targetCurrencySelect.value || "EUR";
  const apiUrl = `https://open.er-api.com/v6/latest/${baseCurrency}?apikey=${apiKey}`;

  try {
    // USTAWIENIE LIMITU CZASU DLA ZAPYTANIA
    errorMessage.textContent = "";
    const currencyData = await fetchDataFromAPI(apiUrl);
    return { currencyData, baseCurrency, targetCurrency };
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      console.log(error);
      throw new Error(
        `Failed to connect to the server. Please check your internet connection and try again.`
      );
    } else {
      throw new Error(`Failed to fetch exchange rates: ${error.message}`);
    }
  }
};

const flagCache = {};
const fetchFlagSvg = async (currency) => {
  try {
    //Sprawdzanie, czy flaga dla danej waluty jest już w pamięci podręcznej
    if (flagCache[currency]) {
      console.log(`Flag for currency ${currency} found in cache`);
      return flagCache[currency];
    }
    const apiURL = `https://restcountries.com/v3.1/currency/${currency}`;

    const flagsSvgData = await fetchDataFromAPI(apiURL);
    if (!flagsSvgData[0]?.flags?.svg) {
      throw new Error(`Flag not found for currency ${currency}.`);
    }
    const flagSVG = flagsSvgData[0].flags.svg;
    flagCache[currency] = flagSVG;
    return flagSVG;
  } catch (error) {
    console.error(error);
    return null; // Zwraca null, aby zamiast rzucenia błędu program mógł nadal się wykonywać
    //z informacją, że brak jest obrazka dla tej waluty. Nie zatrzymam programu
  }
};

const fetchDataFromAPI = async (apiUrl) => {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Error fetching exchange rates. ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch data from API: ${error.message}`);
  }
};

const calculateExchangeRate = (currencyData, baseCurrency, targetCurrency) => {
  const rate = currencyData.rates[targetCurrency];
  exchangeRateInfo.textContent = `1 ${baseCurrency} = ${rate.toFixed(
    4
  )} ${targetCurrency}`;
  targetAmountInput.value = (baseAmountInput.value * rate).toFixed(2);
};

const validateInputAmount = () => {
  const inputValue = baseAmountInput.value;
  const isValid = /^[0-9]*([.,][0-9]*)?$/.test(inputValue);
  const errorMessage = document.querySelector(".input-error");
  if (!isValid) {
    errorMessage.style.display = "block";
    errorMessage.textContent = "Please enter a valid amount";
  } else {
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
  }
};

//wypełnij opcje walu. Populate = wypełniać
const populateCurrencySelectOptions = async (currencyData, targetCurrency) => {
  const popularCurrencies = [
    "PLN",
    "EUR",
    "USD",
    "GBP",
    "JPY",
    "AUD",
    "CAD",
    "CHF",
  ];

  const currenciesCode = Object.keys(currencyData.rates);
  const popularGroup = document.createElement("optgroup");
  popularGroup.label = "Popular";
  const otherGroup = document.createElement("optgroup");
  otherGroup.label = "Other";

  // Iteruję po popularCurrencies by sprawdzic, czy dany kod waluty istnieje w danych
  //jak tak to tworzę listę z tych walut
  for (const currencyCode of popularCurrencies) {
    if (currenciesCode.includes(currencyCode)) {
      createCurrencyOptionElement(currencyCode, popularGroup);
    }
  }
  // Iteruje po wszystkich kodach walut i dodaje do grupy otherGroup te, które nie należą do popularCurrencies
  for (const currencyCode of currenciesCode) {
    if (!popularCurrencies.includes(currencyCode)) {
      createCurrencyOptionElement(currencyCode, otherGroup);
    }
  }
  // Muszę sklonować, bo  nie mogę mieć jednego el. w dwóch miejsach :)
  baseCurrencySelect.appendChild(popularGroup);
  baseCurrencySelect.appendChild(otherGroup);
  targetCurrencySelect.appendChild(popularGroup.cloneNode(true));
  targetCurrencySelect.appendChild(otherGroup.cloneNode(true));

  // Ustawienie wartości domyślnej dla targetCurrencySelect  na targetCurrency, jeśli base_code to "PLN"
  //inaczej mam PLN PLN
  if (currencyData.base_code === "PLN") {
    targetCurrencySelect.value = targetCurrency;
  }
};

const createCurrencyOptionElement = (currencyCode, element) => {
  const option = document.createElement("option");
  option.value = currencyCode;
  option.textContent = currencyCode;
  element.appendChild(option);
};

const swap = () => {
  [baseCurrencySelect.value, targetCurrencySelect.value] = [
    targetCurrencySelect.value,
    baseCurrencySelect.value,
  ]; // destrukturyzacja pozwala na zmianę miejsca wartości
  [baseAmountInput.value, targetAmountInput.value] = [
    targetAmountInput.value,
    baseAmountInput.value,
  ];
  // calculateExchangeRate();
  // fetchExchangeRates();
};

const displayCountryFlags = async (baseCurrency, targetCurrency) => {
  const updateFlag = async (currency, className, container) => {
    let imgTag = document.querySelector(`.${className}`);
    if (!imgTag) {
      imgTag = document.createElement("img");
      imgTag.className = className;
      imgTag.style.width = "42px";
      container.appendChild(imgTag);
    }
    const flagURL = await fetchFlagSvg(currency);
    if (flagURL) {
      imgTag.src = flagURL;
      imgTag.alt = currency;
    }
  };

  await updateFlag(baseCurrency, "flag-img-base", baseFlagsBox);
  await updateFlag(
    targetCurrency,
    "flag-img-targetCurrency",
    targetfetchFlagSvgBox
  );
};

const updateExchangeDetails = async () => {
  try {
    const { currencyData, baseCurrency, targetCurrency } =
      await fetchExchangeRates();
    displayCountryFlags(baseCurrency, targetCurrency);
    populateCurrencySelectOptions(currencyData, targetCurrency);
    calculateExchangeRate(currencyData, baseCurrency, targetCurrency);
    validateInputAmount();
  } catch (error) {
    const errorMessage = document.querySelector(".error-message");
    errorMessage.textContent = error.message;
  }
};

baseCurrencySelect.addEventListener("change", updateExchangeDetails);
targetCurrencySelect.addEventListener("change", updateExchangeDetails);
convertBtn.addEventListener("click", updateExchangeDetails);
swapBtn.addEventListener("click", swap);
updateExchangeDetails();

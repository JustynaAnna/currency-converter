const baseCurrencySelect = document.querySelector("#base-currency");
const baseAmountInput = document.querySelector(".amount-input");
const targetCurrencySelect = document.querySelector("#target-currency");
const targetAmountInput = document.querySelector(".target-amount-input");
const swapBtn = document.querySelector(".swap");
const exchangeRateInfo = document.querySelector(".exchange-rate-info");
const baseFlagsBox = document.querySelector(".base-flags-box");
const targetfetchFlagSvgBox = document.querySelector(".target-flags-box");
const errorMessage = document.querySelector(".error-message");
const apiKey = "4444";

const fetchExchangeData = async () => {
  const baseCurrency = baseCurrencySelect.value || "PLN";
  const currency2 = targetCurrencySelect.value || "EUR";
  const apiUrl = `https://open.er-api.com/v6/latest/${baseCurrency}`;

  try {
    const response = await fetch(apiUrl + `?apikey=${apiKey}`);
    if (!response.ok) {
      throw new Error(`Error fetching exchange rates. ${response.status}`);
    }
    const data = await response.json();
    return { data, baseCurrency, currency2 };
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      console.log(error);
      throw new Error(`Failed to connect to the server`);
    } else {
      throw new Error(`Failed to fetch exchange rates: ${error.message}`);
    }
  }
};

const getFlags = async (currency) => {
  try {
    const apiURL = `https://restcountries.com/v3.1/currency/${currency}`;
    const response = await fetch(apiURL);
    if (!response.ok) {
      throw new Error(`Error fetching flag for currency ${currency}.`);
    }
    const data = await response.json();
    if (!data[0]?.flags?.svg) {
      throw new Error(`Flag not found for currency ${currency}.`);
    }
    return data[0].flags.svg;
  } catch (error) {
    console.error(error);
    return null; // Zwróć null, aby obsłużyć brakujące obrazy flagi
  }
};

const calculateExchangeRate = (data, baseCurrency, currency2) => {
  const rate = data.rates[currency2];
  exchangeRateInfo.textContent = `1 ${baseCurrency} = ${rate.toFixed(
    4
  )} ${currency2}`;
  targetAmountInput.value = (baseAmountInput.value * rate).toFixed(2);
};

const validateInputValue = () => {
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

const currenciesList = (data, currency2) => {
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

  const currenciesCode = Object.keys(data.rates);
  const popularGroup = document.createElement("optgroup");
  popularGroup.label = "Popular";
  const otherGroup = document.createElement("optgroup");
  otherGroup.label = "Other";

  // Iteruję po popularCurrencies by sprawdzic, czy dany kod waluty istnieje w danych
  //jak tak to tworzę listę z tych walut
  for (const currencyCode of popularCurrencies) {
    if (currenciesCode.includes(currencyCode)) {
      const option = document.createElement("option");
      option.value = currencyCode;
      option.textContent = currencyCode;
      popularGroup.appendChild(option);
    }
  }
  // Iteruje po wszystkich kodach walut i dodaje do grupy otherGroup te, które nie należą do popularCurrencies
  for (const currencyCode of currenciesCode) {
    if (!popularCurrencies.includes(currencyCode)) {
      const option = document.createElement("option");
      option.value = currencyCode;
      option.textContent = currencyCode;
      otherGroup.appendChild(option);
    }
  }
  // Muszę sklonować, bo przecież nie mogę mieć jednego el. w dwóch miejsach
  baseCurrencySelect.appendChild(popularGroup);
  baseCurrencySelect.appendChild(otherGroup);
  targetCurrencySelect.appendChild(popularGroup.cloneNode(true)); // Nie klonujemy popularGroup, ponieważ chcemy, aby była ta sama instancja
  targetCurrencySelect.appendChild(otherGroup.cloneNode(true));

  // Ustawienie wartości domyślnej dla targetCurrencySelect na currency2, jeśli base_code to "PLN"
  //inaczej mam PLN PLN
  if (data.base_code === "PLN") {
    targetCurrencySelect.value = currency2;
  }
};

const swap = () => {
  [baseCurrencySelect.value, targetCurrencySelect.value] = [
    targetCurrencySelect.value,
    baseCurrencySelect.value,
  ]; // destrukturyzacja pozwala na zmianę miejsca wartości
  fetchExchangeData();
};

const handleExchange = async () => {
  try {
    const { data, baseCurrency, currency2 } = await fetchExchangeData();

    // Sprawdź, czy tag img dla baseCurrency już istnieje
    let imgTagBaseCurrency = document.querySelector(".flag-img-base");
    if (imgTagBaseCurrency) {
      // Jeśli istnieje, zaktualizuj jego src
      const flagURLBaseCurrency = await getFlags(baseCurrency);
      if (flagURLBaseCurrency) {
        imgTagBaseCurrency.src = flagURLBaseCurrency;
      }
    } else {
      // Jeśli nie istnieje, stwórz nowy tag img dla baseCurrency
      imgTagBaseCurrency = document.createElement("img");
      imgTagBaseCurrency.className = "flag-img-base"; // Dodaj klasę, aby łatwo go znaleźć
      const flagURLBaseCurrency = await getFlags(baseCurrency);
      if (flagURLBaseCurrency) {
        imgTagBaseCurrency.src = flagURLBaseCurrency;
        imgTagBaseCurrency.style.width = "52px";
        baseFlagsBox.appendChild(imgTagBaseCurrency);
      }
    }

    // Sprawdź, czy tag img dla currency2 już istnieje
    let imgTagCurrency2 = document.querySelector(".flag-img-currency2");
    if (imgTagCurrency2) {
      // Jeśli istnieje, zaktualizuj jego src
      const flagURLCurrency2 = await getFlags(currency2);
      if (flagURLCurrency2) {
        imgTagCurrency2.src = flagURLCurrency2;
      }
    } else {
      // Jeśli nie istnieje, stwórz nowy tag img dla currency2
      imgTagCurrency2 = document.createElement("img");
      imgTagCurrency2.className = "flag-img-currency2"; // Dodaj klasę, aby łatwo go znaleźć
      const flagURLCurrency2 = await getFlags(currency2);
      if (flagURLCurrency2) {
        imgTagCurrency2.src = flagURLCurrency2;
        imgTagCurrency2.style.width = "52px";
        targetfetchFlagSvgBox.appendChild(imgTagCurrency2);
      }
    }

    currenciesList(data, currency2);
    calculateExchangeRate(data, baseCurrency, currency2);
    validateInputValue();
  } catch (error) {
    const errorMessage = document.querySelector(".error-message");
    errorMessage.textContent = error.message;
  }
};

baseCurrencySelect.addEventListener("change", handleExchange);
targetCurrencySelect.addEventListener("change", handleExchange);
baseAmountInput.addEventListener("input", handleExchange);
swapBtn.addEventListener("click", swap);
handleExchange();

const currencyOne = document.querySelector("#currency-one");
const amountOne = document.querySelector(".amount-one");
const currencyTwo = document.querySelector("#currency-two");
const amountTwo = document.querySelector(".amount-two");
const swapBtn = document.querySelector(".swap");
const rateInfo = document.querySelector(".rate-info");
const selectBoxLeft = document.querySelector(".select-box");
const selectBoxRight = document.querySelector(".select-box-right");
const apiKey = "ae187835fa5da279b910fcd0";

const fetchExchangeData = async () => {
  const baseCurrency = currencyOne.value || "PLN";
  const currency2 = currencyTwo.value || "EUR";
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
  rateInfo.textContent = `1 ${baseCurrency} = ${rate.toFixed(4)} ${currency2}`;
  amountTwo.value = (amountOne.value * rate).toFixed(2);
};

const validateInputValue = () => {
  const inputValue = amountOne.value;
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
  currencyOne.appendChild(popularGroup);
  currencyOne.appendChild(otherGroup);
  currencyTwo.appendChild(popularGroup.cloneNode(true)); // Nie klonujemy popularGroup, ponieważ chcemy, aby była ta sama instancja
  currencyTwo.appendChild(otherGroup.cloneNode(true));

  // Ustawienie wartości domyślnej dla currencyTwo na currency2, jeśli base_code to "PLN"
  //inaczej mam PLN PLN
  if (data.base_code === "PLN") {
    currencyTwo.value = currency2;
  }
};

const swap = () => {
  [currencyOne.value, currencyTwo.value] = [
    currencyTwo.value,
    currencyOne.value,
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
        selectBoxLeft.appendChild(imgTagBaseCurrency);
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
        selectBoxRight.appendChild(imgTagCurrency2);
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

currencyOne.addEventListener("change", handleExchange);
currencyTwo.addEventListener("change", handleExchange);
amountOne.addEventListener("input", handleExchange);
swapBtn.addEventListener("click", swap);
handleExchange();

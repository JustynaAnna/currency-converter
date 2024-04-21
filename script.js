const currencyOne = document.querySelector("#currency-one");
const amountOne = document.querySelector(".amount-one");
const currencyTwo = document.querySelector("#currency-two");
const amountTwo = document.querySelector(".amount-two");
const swapBtn = document.querySelector(".swap");
const rateInfo = document.querySelector(".rate-info");
const apiKey = "444";

const fetchExchangeData = async () => {
  const baseCurrency = currencyOne.value || "PLN";
  const currency2 = currencyTwo.value || "EUR";

  const apiUrl = `https://open.er-api.com/v6/latest/${baseCurrency}`;

  try {
    const response = await fetch(apiUrl + `?apikey=${apiKey}`);
    if (!response.ok) {
      throw new Error(`Error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    return { data, baseCurrency, currency2 };
  } catch (error) {
    const errorMessage = document.querySelector(".error-message");
    errorMessage.textContent = `An error occured: ${error.message}`;
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

const handleExchange = async () => {
  try {
    const { data, baseCurrency, currency2 } = await fetchExchangeData();
    currenciesList(data, currency2);
    calculateExchangeRate(data, baseCurrency, currency2);
    validateInputValue();
  } catch (error) {
    const errorMessage = document.querySelector(".error-message");
    errorMessage.textContent = error.message;
  }
};

const swap = () => {
  [currencyOne.value, currencyTwo.value] = [
    currencyTwo.value,
    currencyOne.value,
  ]; // destrukturyzacja pozwala na zmianę miejsca wartości
  fetchExchangeData();
};

currencyOne.addEventListener("change", handleExchange);
currencyTwo.addEventListener("change", handleExchange);
amountOne.addEventListener("input", handleExchange);
swapBtn.addEventListener("click", swap);
handleExchange();

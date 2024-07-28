import { fetchExchangeRates } from "./api.js";
import { displayCountryFlags } from "./flags.js";
import { createCurrencyOptionElement } from "./helpers.js";

export const populateCurrencySelectOptions = async (
  currencyData,
  targetCurrency
) => {
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

  for (const currencyCode of popularCurrencies) {
    if (currenciesCode.includes(currencyCode)) {
      createCurrencyOptionElement(currencyCode, popularGroup);
    }
  }
  for (const currencyCode of currenciesCode) {
    if (!popularCurrencies.includes(currencyCode)) {
      createCurrencyOptionElement(currencyCode, otherGroup);
    }
  }

  const baseCurrencySelect = document.querySelector("#base-currency");
  const targetCurrencySelect = document.querySelector("#target-currency");

  baseCurrencySelect.appendChild(popularGroup);
  baseCurrencySelect.appendChild(otherGroup);
  targetCurrencySelect.appendChild(popularGroup.cloneNode(true));
  targetCurrencySelect.appendChild(otherGroup.cloneNode(true));

  if (currencyData.base_code === "PLN") {
    targetCurrencySelect.value = targetCurrency;
  }
};

export const calculateExchangeRate = (
  currencyData,
  baseCurrency,
  targetCurrency
) => {
  const exchangeRateInfo = document.querySelector(".exchange-rate-info");
  const baseAmountInput = document.querySelector(".input-amount-from");
  const targetAmountInput = document.querySelector(".input-amount-to");

  const rate = currencyData.rates[targetCurrency];
  exchangeRateInfo.textContent = `1 ${baseCurrency} = ${rate.toFixed(
    4
  )} ${targetCurrency}`;
  targetAmountInput.value = (baseAmountInput.value * rate).toFixed(2);
};

export const swap = () => {
  const baseCurrencySelect = document.querySelector("#base-currency");
  const targetCurrencySelect = document.querySelector("#target-currency");
  const baseAmountInput = document.querySelector(".input-amount-from");
  const targetAmountInput = document.querySelector(".input-amount-to");

  [baseCurrencySelect.value, targetCurrencySelect.value] = [
    targetCurrencySelect.value,
    baseCurrencySelect.value,
  ];
  [baseAmountInput.value, targetAmountInput.value] = [
    targetAmountInput.value,
    baseAmountInput.value,
  ];
  updateExchangeDetails();
};

export const updateExchangeDetails = async () => {
  const errorMessage = document.querySelector(".error-message");

  try {
    const baseCurrency =
      document.querySelector("#base-currency").value || "PLN";
    const targetCurrency =
      document.querySelector("#target-currency").value || "EUR";
    const { currencyData } = await fetchExchangeRates(
      baseCurrency,
      targetCurrency
    );

    displayCountryFlags(baseCurrency, targetCurrency);
    populateCurrencySelectOptions(currencyData, targetCurrency);
    calculateExchangeRate(currencyData, baseCurrency, targetCurrency);
  } catch (error) {
    errorMessage.textContent = error.message;
  }
};

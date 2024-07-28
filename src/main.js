import { updateExchangeDetails, swap } from "./modules/dom.js";
import { validateInputAmount } from "./modules/helpers.js";

const baseAmountInput = document.querySelector(".input-amount-from");
const baseCurrencySelect = document.querySelector("#base-currency");
const targetCurrencySelect = document.querySelector("#target-currency");
const convertBtn = document.querySelector(".convert");
const swapBtn = document.querySelector(".swap");

baseAmountInput.addEventListener("input", validateInputAmount);
baseCurrencySelect.addEventListener("change", updateExchangeDetails);
targetCurrencySelect.addEventListener("change", updateExchangeDetails);
convertBtn.addEventListener("click", updateExchangeDetails);
swapBtn.addEventListener("click", swap);
updateExchangeDetails();

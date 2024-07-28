const apiKey = "ae187835f5ada279b910fcd0";

export const fetchExchangeRates = async (baseCurrency, targetCurrency) => {
  const apiUrl = `https://open.er-api.com/v6/latest/${baseCurrency}?apikey=${apiKey}`;

  try {
    const currencyData = await fetchDataFromAPI(apiUrl);
    return { currencyData, baseCurrency, targetCurrency };
  } catch (error) {
    throw new Error(`Failed to fetch exchange rates: ${error.message}`);
  }
};

export const fetchDataFromAPI = async (apiUrl) => {
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

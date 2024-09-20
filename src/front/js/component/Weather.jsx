import React, { useState } from "react";
const URL_BASE = 'https://api.openweathermap.org/data/2.5/weather?appid=97564e651a56e29b194b694d428277b8&units=metric&lang=es&'
export const Weather = () => {
    const [searchWeather, setSearchWeather] = useState({
        city: "",
        country: ""
    });
    const [weather, setWeather] = useState(null);
    const handleChange = (event) => {
        setSearchWeather({
            ...searchWeather,
            [event.target.name]: event.target.value
        });
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            if (searchWeather.city.trim() === "" || searchWeather.country.trim() === "") {
                return;
            }
            const response = await fetch(`${URL_BASE}q=${searchWeather.city},${searchWeather.country}`);
            const data = await response.json();
            setWeather(data);
        } catch (error) {
            console.error("Error fetching weather:", error);
        }
    };
    return (
        <div className="container">
            <div className="row">
                <div className="my-md-3">
                    <h2 className="text-center">Clima</h2>
                </div>
                <div className="col-12 p-3">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="city">Ciudad:</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Escribe el nombre de la ciudad"
                                id="city"
                                name="city"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="country">País</label>
                            <select
                                className="form-control"
                                id="country"
                                name="country"
                                onChange={handleChange}
                            >
                                <option value="">Selecciona un país</option>
                                <option value="US">Estados Unidos</option>
                                <option value="MX">México</option>
                                <option value="AR">Argentina</option>
                                <option value="CO">Colombia</option>
                                <option value="ES">España</option>
                                <option value="VE">Venezuela</option>
                            </select>
                        </div>
                        <button className="btn btn-primary col-12 mt-3">Consulta clima</button>
                    </form>
                </div>
                <div className="col-12 col-md-12 d-flex align-items-center p-3">
                    {
                        !weather ? "Consulta el clima" :
                            weather.cod === "404" ? "Valida la Ciudad y el país" :
                                <div>
                                    <div className="col-12 text-center">
                                        <h3> {Math.ceil(weather?.main?.temp)}°C</h3>
                                    </div>
                                    <div >
                                        <p className="p-2  col-12">
                                            <span>Temp-max:</span> {Math.ceil(weather?.main?.temp_max)} °C
                                        </p>
                                        <p className="p-2 col-12">
                                            <span>Temp-min:</span> {Math.ceil(weather?.main?.temp_min)} °C
                                        </p>
                                        <p className="p-2 col-12">
                                            <span>Humedad:</span> {Math.ceil(weather?.main?.humidity)} %
                                        </p>
                                    </div>
                                </div>
                    }
                </div>
            </div>
        </div>
    )
};

import { CreateTask } from "../component/CreateTask";

const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			message: null,
			demo: [
				{
					title: "FIRST",
					background: "white",
					initial: "white"
				},
				{
					title: "SECOND",
					background: "white",
					initial: "white"
				}
			],
            token: localStorage.getItem("token") || null,
            user: localStorage.getItem("user")|| null
		},
		actions: {
			// Use getActions to call a function within a fuction
			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},

			getMessage: async () => {
				try{
					// fetching data from the backend
					const resp = await fetch(process.env.BACKEND_URL + "/api/hello")
					const data = await resp.json()
					setStore({ message: data.message })
					// don't forget to return something, that is how the async resolves
					return data;
				}catch(error){
					console.log("Error loading message from backend", error)
				}
			},
			changeColor: (index, color) => {
				//get the store
				const store = getStore();

				//we have to loop the entire demo array to look for the respective index
				//and change its color
				const demo = store.demo.map((elm, i) => {
					if (i === index) elm.background = color;
					return elm;
				});

				//reset the global store
				setStore({ demo: demo });
			},

            login: async (user) => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/login`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify(user)
					})
					const data = await response.json()
					if (response.status == 200) {
						setStore({
							token: data.token
						})
						localStorage.setItem("token", data.token)
						getActions().getUserLogin()
						return true
					} else {
						return false
					}

				} catch (error) {
					console.log(error)
				}
			},

            getUserLogin: async() =>{
                try{
                    const response = await fetch('${process.env.BACKEND_URL}/api/user', {
                        method:'GET',
                        headers: {
                            "Authorization":'Bearer ${getStore().token}'
                        }
                    })
                    const data = await response.json()
                    if (response.ok){
                        setStrore({
                            user:data
                        })
                        localStorage.setItem("user", JSON.stringify(data))
                    }
                }
                catch (error){
                    console.log(error)
                }
            },

			register: async (userData) => {
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/user`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(userData)
                    });
                    const data = await response.json();
                    if (response.status === 201) {
                        // Registro exitoso
                        return { success: true, message: "Usuario registrado con éxito" };
                    } else {
                        // Registro fallido
                        return { success: false, message: data.message || "Error en el registro" };
                    }
                } catch (error) {
                    console.error("Error en el registro:", error);
                    return { success: false, message: "Error en la conexión" };
                }
            },

			handleSubmit: async (event) => {
				try {if(event.key === "Click"){
					if (task.label.trim() !== ""){
						const response = await fetch(`${process.env.BACKEND_URL}/`,{
							method: "POST",
							headers: {
								"Content-Type": "application/json"
							}
							body: JSON.stringify(task)
						})
						if(response.ok){
							updateTask()
							setTask(initailState)
						}else{
							console.log(error)
						}
					}
				}}
			}
		}
	};
};

export default getState;

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
            user: localStorage.getItem("user")|| null,
			organizationUsers: [],
			projects: [],
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

            getUserLogin: async () => {
                try {
                    const store = getStore();
                    const response = await fetch(`${process.env.BACKEND_URL}/api/user`, {
                        method: 'GET',
                        headers: {
                            "Authorization": `Bearer ${store.token}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setStore({
                            user: data
                        });
                        localStorage.setItem("user", JSON.stringify(data));
                        await getActions().getUserTasks();
                    } else {
                        throw new Error("Failed to fetch user data");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            },

			createProject: async (projectData) => {
				const store = getStore();
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/projects`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${store.token}`
						},
						body: JSON.stringify(projectData)
					});
			
					if (!response.ok) {
						throw new Error('Failed to create project');
					}
			
					const data = await response.json();
			
					// Actualizar el store con el nuevo proyecto
					setStore({ 
						projects: [...store.projects, data]
					});
			
					return { success: true, project: data };
				} catch (error) {
					console.error('Error creating project:', error);
					return { success: false, error: error.message };
				}
			},
			
			getProjects: async () => {
				const store = getStore();
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/projects`, {
						method: 'GET',
						headers: {
							'Authorization': `Bearer ${store.token}`
						}
					});
			
					if (!response.ok) {
						throw new Error('Failed to fetch projects');
					}
			
					const data = await response.json();
					setStore({ projects: data });
					return data;
				} catch (error) {
					console.error('Error fetching projects:', error);
					return [];
				}
			},

            getUserTasks: async () => {
                try {
                    const store = getStore();
                    const response = await fetch(`${process.env.BACKEND_URL}/api/task`, {
                        method: 'GET',
                        headers: {
                            "Authorization": `Bearer ${store.token}`
                        }
                    });
                    if (response.ok) {
                        const tasksData = await response.json();
                        setStore({
                            tasks: tasksData
                        });
                    } else {
                        throw new Error("Failed to fetch user tasks");
                    }
                } catch (error) {
                    console.error("Error fetching user tasks:", error);
                }
            },

			getOrganizationUsers: async () => {
				const store = getStore();
				try {
					const resp = await fetch(process.env.BACKEND_URL + "/api/organization-users", {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							"Authorization": "Bearer " + store.token
						}
					});
					const data = await resp.json();
					setStore({ organizationUsers: data });
					return data;
				} catch (error) {
					console.error("Error loading organization users from backend", error);
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
		}
	};
};

export default getState;

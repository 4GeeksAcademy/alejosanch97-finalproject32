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
			tasks: [],
			projectMembers: {},
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
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${store.token}`
						},
						body: JSON.stringify(projectData)
					});
					const data = await response.json();
					if (response.status === 201) {
						setStore({ 
							projects: [...store.projects, data]
						});
						return { success: true, message: "Proyecto creado con éxito", project: data };
					} else {
						return { success: false, message: data.message || "Error al crear el proyecto" };
					}
				} catch (error) {
					console.error("Error al crear el proyecto:", error);
					return { success: false, message: "Error en la conexión" };
				}
			},

			createTask: async (projectId, taskData) => {
				const store = getStore();
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/projects/${projectId}/tasks`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${store.token}`
						},
						body: JSON.stringify(taskData)
					});
					const data = await response.json();
					if (response.status === 201) {
						setStore({
							tasks: [...store.tasks, data]
						});
						return { success: true, message: "Tarea creada con éxito", task: data };
					} else {
						return { success: false, message: data.message || "Error al crear la tarea" };
					}
				} catch (error) {
					console.error("Error al crear la tarea:", error);
					return { success: false, message: "Error en la conexión" };
				}
			},

			createSubtask: async (taskId, subtaskData) => {
				const store = getStore();
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/tasks/${taskId}/subtasks`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${store.token}`
						},
						body: JSON.stringify(subtaskData)
					});
					const data = await response.json();
					if (response.status === 201) {
						// Update the store with the new subtask
						// You might need to adjust this based on how you're storing subtasks
						return { success: true, message: "Subtarea creada con éxito", subtask: data };
					} else {
						return { success: false, message: data.message || "Error al crear la subtarea" };
					}
				} catch (error) {
					console.error("Error al crear la subtarea:", error);
					return { success: false, message: "Error en la conexión" };
				}
			},

			updateTaskStatus: async (taskId, newStatus) => {
				const store = getStore();
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/tasks/${taskId}`, {
						method: "PATCH",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${store.token}`
						},
						body: JSON.stringify({ status: newStatus })
					});
					const data = await response.json();
					if (response.status === 200) {
						// Update the task status in the store
						const updatedTasks = store.tasks.map(task => 
							task.id === taskId ? { ...task, status: newStatus } : task
						);
						setStore({ tasks: updatedTasks });
						return { success: true, message: "Estado de la tarea actualizado con éxito", task: data };
					} else {
						return { success: false, message: data.message || "Error al actualizar el estado de la tarea" };
					}
				} catch (error) {
					console.error("Error al actualizar el estado de la tarea:", error);
					return { success: false, message: "Error en la conexión" };
				}
			},

			addUserToProject: async (projectId, userId) => {
				const store = getStore();
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/projects/${projectId}/members`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${store.token}`
						},
						body: JSON.stringify({ user_id: userId })
					});
					const data = await response.json();
					if (response.status === 201) {
						const updatedProjectMembers = {
							...store.projectMembers,
							[projectId]: [...(store.projectMembers[projectId] || []), data]
						};
						setStore({ projectMembers: updatedProjectMembers });
						return { success: true, message: "Usuario añadido al proyecto con éxito", member: data };
					} else {
						return { success: false, message: data.message || "Error al añadir usuario al proyecto" };
					}
				} catch (error) {
					console.error("Error al añadir usuario al proyecto:", error);
					return { success: false, message: "Error en la conexión" };
				}
			},

			getProjectTasks: async (projectId) => {
				const store = getStore();
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/projects/${projectId}/tasks`, {
						method: 'GET',
						headers: {
							'Authorization': `Bearer ${store.token}`
						}
					});

					if (!response.ok) {
						throw new Error('Failed to fetch project tasks');
					}

					const data = await response.json();
					setStore({ tasks: [...store.tasks, ...data] });
					return data;
				} catch (error) {
					console.error('Error fetching project tasks:', error);
					return [];
				}
			},

			getProjectMembers: async (projectId) => {
				const store = getStore();
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/projects/${projectId}/members`, {
						method: 'GET',
						headers: {
							'Authorization': `Bearer ${store.token}`
						}
					});

					if (!response.ok) {
						throw new Error('Failed to fetch project members');
					}

					const data = await response.json();
					setStore({ 
						projectMembers: {
							...store.projectMembers,
							[projectId]: data
						}
					});
					return data;
				} catch (error) {
					console.error('Error fetching project members:', error);
					return [];
				}
			},

			getProjects: async () => {
				const store = getStore();
				const actions = getActions();
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

					const projects = await response.json();
					setStore({ projects });

					// Fetch tasks and members for each project
					for (let project of projects) {
						await actions.getProjectTasks(project.id);
						await actions.getProjectMembers(project.id);
					}

					return projects;
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

			registerUserAndEnterprise: async (formData) => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/user`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify(formData)
					});
					const data = await response.json();
					if (response.ok) {
						return { success: true, message: "Usuario y empresa registrados con éxito" };
					} else {
						return { success: false, message: data.message || "Error en el registro" };
					}
				} catch (error) {
					console.error("Error en el registro:", error);
					return { success: false, message: "Error en la conexión" };
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

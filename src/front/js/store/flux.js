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
			projectTasks: {},
			projectMembers: {},
			projectProgress: [],
     		taskCompletionRate: [],
      		taskDistribution: {},
      		userProductivity: [],
      		ganttData: []
			
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

			getAllTasksWithProjects: async () => {
				const store = getStore();
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/all-tasks-with-projects`, {
						method: 'GET',
						headers: {
							'Authorization': `Bearer ${store.token}`
						}
					});
			
					if (!response.ok) {
						throw new Error('Failed to fetch tasks with projects');
					}
			
					const tasksWithProjects = await response.json();
					setStore({ tasksWithProjects: tasksWithProjects });
					return tasksWithProjects;
				} catch (error) {
					console.error('Error fetching tasks with projects:', error);
					return [];
				}
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

			updateUser: async (userData) => {
                const store = getStore();
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/user/${userData.id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${store.token}`
                        },
                        body: JSON.stringify(userData)
                    });
                    const data = await response.json();
                    if (response.status === 200) {
                        // Actualizar el usuario en el store
                        const updatedUsers = store.organizationUsers.map(user => 
                            user.id === userData.id ? {...user, ...userData} : user
                        );
                        setStore({ organizationUsers: updatedUsers });
                        return { success: true, message: "Usuario actualizado con éxito" };
                    } else {
                        return { success: false, message: data.message || "Error al actualizar usuario" };
                    }
                } catch (error) {
                    console.error("Error al actualizar usuario:", error);
                    return { success: false, message: "Error en la conexión" };
                }
            },

			deleteUser: async (userId) => {
                const store = getStore();
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/user/${userId}`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${store.token}`
                        }
                    });
                    const data = await response.json();
                    if (response.status === 200) {
                        // Eliminar el usuario del store
                        const updatedUsers = store.organizationUsers.filter(user => user.id !== userId);
                        setStore({ organizationUsers: updatedUsers });
                        return { success: true, message: "Usuario eliminado con éxito" };
                    } else {
                        return { success: false, message: data.message || "Error al eliminar usuario" };
                    }
                } catch (error) {
                    console.error("Error al eliminar usuario:", error);
                    return { success: false, message: "Error en la conexión" };
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

			updateProject: async (projectId, projectData) => {
				const store = getStore();
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/project/${projectId}`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${store.token}`
						},
						body: JSON.stringify(projectData)
					});
			
					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(errorData.message || 'Failed to update project');
					}
			
					const updatedProject = await response.json();
					const updatedProjects = store.projects.map(project => 
						project.id === projectId ? updatedProject : project
					);
					setStore({ projects: updatedProjects });
					return { success: true, project: updatedProject };
				} catch (error) {
					console.error('Error updating project:', error);
					return { success: false, message: error.message };
				}
			},
			
			deleteProject: async (projectId) => {
				const store = getStore();
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/project/${projectId}`, {
						method: 'DELETE',
						headers: {
							'Authorization': `Bearer ${store.token}`
						}
					});
			
					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(errorData.message || 'Failed to delete project');
					}
			
					const updatedProjects = store.projects.filter(project => project.id !== projectId);
					setStore({ projects: updatedProjects });
					return { success: true };
				} catch (error) {
					console.error('Error deleting project:', error);
					return { success: false, message: error.message };
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
			
					const projects = await response.json();
					setStore({ projects: projects });
			
					return projects;
				} catch (error) {
					console.error('Error fetching projects:', error);
					return [];
				}
			},

			getProjectTasks: async (projectId) => {
				const store = getStore();
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/project/${projectId}/tasks`, {
						method: 'GET',
						headers: {
							'Authorization': `Bearer ${store.token}`
						}
					});
			
					if (!response.ok) {
						throw new Error('Failed to fetch project tasks');
					}
			
					const tasks = await response.json();
					setStore({ 
						projectTasks: { ...store.projectTasks, [projectId]: tasks }
					});
			
					return tasks;
				} catch (error) {
					console.error('Error fetching project tasks:', error);
					return [];
				}
			},

			addProjectTask: async (projectId, taskData) => {
				const store = getStore();
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/project/${projectId}/tasks`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${store.token}`
						},
						body: JSON.stringify(taskData)
					});
			
					if (!response.ok) {
						throw new Error('Failed to add project task');
					}
			
					const newTask = await response.json();
					const updatedTasks = [...(store.projectTasks[projectId] || []), newTask];
					setStore({ 
						projectTasks: { ...store.projectTasks, [projectId]: updatedTasks }
					});
			
					return newTask;
				} catch (error) {
					console.error('Error adding project task:', error);
					return null;
				}
			},

			getProjectMembers: async (projectId) => {
				const store = getStore();
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/project/${projectId}/members`, {
						method: 'GET',
						headers: {
							'Authorization': `Bearer ${store.token}`,
							'Content-Type': 'application/json'
						}
					});
			
					if (!response.ok) {
						throw new Error('Failed to fetch project members');
					}
			
					const members = await response.json();
					setStore({
						projectMembers: { ...store.projectMembers, [projectId]: members }
					});
			
					return members;
				} catch (error) {
					console.error('Error fetching project members:', error);
					return [];
				}
			},

			addProjectMember: async (projectId, email) => {
				const store = getStore();
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/project/${projectId}/members`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${store.token}`
						},
						body: JSON.stringify({ email: email })
					});
			
					const data = await response.json();
			
					if (!response.ok) {
						throw new Error(data.message || 'Failed to add project member');
					}
			
					const updatedMembers = [...(store.projectMembers[projectId] || []), data];
					setStore({ 
						projectMembers: { ...store.projectMembers, [projectId]: updatedMembers }
					});
			
					return { success: true, message: 'Miembro agregado exitosamente' };
				} catch (error) {
					console.error('Error adding project member:', error);
					return { success: false, message: error.message };
				}
			},

			updateTask: async (taskId, taskData) => {
				const store = getStore();
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/task/${taskId}`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${store.token}`
						},
						body: JSON.stringify(taskData)
					});
			
					if (!response.ok) {
						throw new Error('Failed to update task');
					}
			
					const updatedTask = await response.json();
					return updatedTask;
				} catch (error) {
					console.error('Error updating task:', error);
					return null;
				}
			},

			deleteTask: async (taskId) => {
				const store = getStore();
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/task/${taskId}`, {
						method: 'DELETE',
						headers: {
							'Authorization': `Bearer ${store.token}`
						}
					});
			
					if (!response.ok) {
						throw new Error('Failed to delete task');
					}
			
					return true;
				} catch (error) {
					console.error('Error deleting task:', error);
					return false;
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

			// dashboard
			getProjectProgress: async () => {
				const store = getStore();
				try {
				  const resp = await fetch(`${process.env.BACKEND_URL}/api/dashboard/project-progress`, {
					headers: { "Authorization": `Bearer ${store.token}` }
				  });
				  const data = await resp.json();
				  setStore({ projectProgress: data });
				} catch (error) {
				  console.error("Error fetching project progress", error);
				}
			  },
		
			  getTaskCompletionRate: async () => {
				const store = getStore();
				try {
				  const resp = await fetch(`${process.env.BACKEND_URL}/api/dashboard/task-completion-rate`, {
					headers: { "Authorization": `Bearer ${store.token}` }
				  });
				  const data = await resp.json();
				  setStore({ taskCompletionRate: data });
				} catch (error) {
				  console.error("Error fetching task completion rate", error);
				}
			  },
		
			  getTaskDistribution: async () => {
				const store = getStore();
				try {
				  const resp = await fetch(`${process.env.BACKEND_URL}/api/dashboard/task-distribution`, {
					headers: { "Authorization": `Bearer ${store.token}` }
				  });
				  const data = await resp.json();
				  setStore({ taskDistribution: data });
				} catch (error) {
				  console.error("Error fetching task distribution", error);
				}
			  },
		
			  getUserProductivity: async () => {
				const store = getStore();
				try {
				  const resp = await fetch(`${process.env.BACKEND_URL}/api/dashboard/user-productivity`, {
					headers: { "Authorization": `Bearer ${store.token}` }
				  });
				  const data = await resp.json();
				  setStore({ userProductivity: data });
				} catch (error) {
				  console.error("Error fetching user productivity", error);
				}
			  },

			  getGanttData: async () => {
				const store = getStore();
				try {
				  const resp = await fetch(`${process.env.BACKEND_URL}/api/dashboard/gantt-data`, {
					headers: { "Authorization": `Bearer ${store.token}` }
				  });
				  const data = await resp.json();
				  setStore({ ganttData: data });
				} catch (error) {
				  console.error("Error fetching Gantt data", error);
				}
			  }
		}
	};
};

export default getState;

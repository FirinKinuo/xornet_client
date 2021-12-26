import type { RouteRecordRaw } from "vue-router";
import { createRouter, createWebHashHistory } from "vue-router";

export type FancyRouteRecord = RouteRecordRaw & { icon?: string };

export const routes: (FancyRouteRecord & { children?: FancyRouteRecord[] })[] = [
	{
		path: "/auth",
		name: "auth",
		component: () => import("./views/Auth/Auth.vue"),
		children: [
			{
				path: "login",
				name: "login",
				component: () => import("./views/Auth/Login.vue"),
			},
			{
				path: "signup",
				name: "signup",
				component: () => import("./views/Auth/Signup.vue"),
			},
		],
	},
	{
		path: "/dashboard",
		name: "dashboard",
		component: () => import("./views/Dashboard/Dashboard.vue"),
		children: [
			{
				path: "machines",
				name: "machines",
				icon: "nas",
				component: () => import("./views/Dashboard/MachinesView.vue"),
			},
			{
				path: "settings/:setting?",
				name: "settings",
				icon: "settings",
				component: () => import("./views/Dashboard/SettingsView.vue"),
			},
		],
	},
];

export default createRouter({
	routes,
	history: createWebHashHistory(),
});

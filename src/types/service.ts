export interface Service {
	name: string;
	filename: string;
	status: string;
	timerStatus?: string;
	timerTrigger?: string;
}

export interface ServicesResponse {
	servicesStatusArray: Service[];
}

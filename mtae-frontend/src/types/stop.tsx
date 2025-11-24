export type StopRoute = {
	route_short_name: string;
	route_long_name: string;
	route_color: string;      
	route_text_color: string; 
};

export type StopProps = {
    stop_id: string;
    stop_name: string;
    parent_station?: string;
    routes?: StopRoute[];
};
type T = (client: Bot, reason: string, err: Error) => Promise<void>;
export const handleError: T = async () => {
	return;
};

export default handleError;

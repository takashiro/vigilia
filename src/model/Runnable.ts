export interface RunnableObject {
	exec(): unknown;
}

export interface RunnableFunc {
	(): unknown;
}

export type Runnable = RunnableObject | RunnableFunc;

export default Runnable;

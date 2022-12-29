export interface Credentials {
    email: string;
    password: string;
    isGoogleLogin?: boolean;
}

export interface ErrorResponse {
    error: string;
}

export interface DataResponse {
    message: string;
}
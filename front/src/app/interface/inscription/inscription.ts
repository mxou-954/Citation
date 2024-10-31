export interface InscriptionData {
    nom : string,
    email: string,
    password: string,
    confirmPassword : string;
}

export interface APIResponse {
    success : Boolean,
    message: string
}
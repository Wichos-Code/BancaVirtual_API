import { google } from "googleapis";
import dotenv from "dotenv"

dotenv.config()

const CLIENT_ID = process.env.GMAIL_CLIENT_ID
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI || "https://developers.google.com/oauthplayground"
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
)

oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN})

export const getAccessToken = async () => {
    try {
        const accessTokenResponse = await oAuth2Client.getAccessToken()
        return accessTokenResponse.token
    } catch (error) {
        console.error("Error obteniendo access token: ", error)
        throw error
    }
}
import { AwsRum, AwsRumConfig } from "aws-rum-web";

export default async function initRum() {
  try {
    const config: AwsRumConfig = {
      sessionSampleRate: 1,
      guestRoleArn:
        "arn:aws:iam::822842917460:role/RUM-Monitor-us-east-1-822842917460-8467712758861-Unauth",
      identityPoolId: "us-east-1:2192683a-e1b2-4b4e-9013-d28728f1aa3f",
      endpoint: "https://dataplane.rum.us-east-1.amazonaws.com",
      telemetries: ["performance", "errors", "http"],
      allowCookies: true,
      enableXRay: false,
    };

    const APPLICATION_ID: string = "783b6c6e-9e7d-4f71-a780-a64f4c803201";
    const APPLICATION_VERSION: string = "1.0.0";
    const APPLICATION_REGION: string = "us-east-1";

    const awsRum: AwsRum = new AwsRum(
      APPLICATION_ID,
      APPLICATION_VERSION,
      APPLICATION_REGION,
      config
    );
    return awsRum;
  } catch (error) {
    // Ignore errors thrown during CloudWatch RUM web client initialization
  }
}

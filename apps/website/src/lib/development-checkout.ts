export function canUseDevelopmentCheckout(
  mode: string,
  enabled: string | undefined,
) {
  return mode === "emulator" && enabled === "true";
}
export function acceptedTestCard(token: string) {
  return token === "visa-success";
}

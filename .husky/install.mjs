if (
  process.env.HUSKY !== "0" &&
  process.env.NODE_ENV !== "production" &&
  process.env.CI !== "true"
) {
  const { default: installHusky } = await import("husky");
  const message = installHusky();
  if (message) console.log(message);
}

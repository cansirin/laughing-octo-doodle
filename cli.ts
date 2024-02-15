const testAccesibility = async (
  url: string,
  incomplete: boolean,
  inapplicable: boolean
) => {
  const response = await fetch("http://localhost:3000/check-a11y", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, incomplete, inapplicable }),
  });

  console.log(await response.json());

  // const response: CheckA11yResponse = await data.json();

  // const violations = response.violations;

  // if (violations.length > 0) {
  //   console.error(`Accessibility violations found for ${url}`);
  //   console.error(violations);
  //   process.exit(1);
  // } else {
  //   console.log(`No accessibility violations found for ${url}`);
  // }
};

testAccesibility("https://csirin.com", false, false);

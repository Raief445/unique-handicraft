const fs = require('fs');
const path = require('path');

async function testSubmit() {
  const formData = new FormData();
  formData.append("fullName", "Test User");
  formData.append("companyName", "Test Co");
  formData.append("email", "test@example.com");
  formData.append("location", "Test City");
  formData.append("country", "Test Country");
  formData.append("items", JSON.stringify([{ productId: "1", name: "P1", productCode: "C1", quantity: 1 }]));
  
  // create dummy file
  const fileBlob = new Blob(["test data"], { type: "image/png" });
  formData.append("file", fileBlob, "test.png");

  const res = await fetch("http://localhost:3000/api/enquiry", {
    method: "POST",
    body: formData
  });

  const text = await res.text();
  console.log("STATUS:", res.status);
  console.log("RESPONSE:", text);
}

testSubmit();

const uploadInput = document.getElementById('uploadModelInput');

uploadInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.name.endsWith('.obj')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const objContent = e.target.result;
      console.log('OBJ file content:', objContent);
    };
    reader.readAsText(file);
  } else {
    alert('Please select a valid .obj file.');
  }
});




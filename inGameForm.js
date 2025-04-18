widthInput = document.getElementById("width");
heightInput = document.getElementById("height");
mineInput = document.getElementById("mines");
submitButton = document.getElementById("submit");

submitButton.addEventListener("click", function() {
    let w = parseInt(widthInput.value);
    let h = parseInt(heightInput.value);
    let m = parseInt(mineInput.value);

    if (w < 1 || h < 1 || m < 1 || m > w * h - 9 || (w <= 3 && h <= 3)) {
        return;
    }

    init(w, h, m);
})
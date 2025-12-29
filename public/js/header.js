document.addEventListener("DOMContentLoaded", sepetSayisiniGetir);

function sepetSayisiniGetir() {
    fetch("/api/sepet/sayi")
        .then(res => res.json())
        .then(data => {
            document.getElementById("sepet-sayi").innerText = data.toplam;
        });
}
  

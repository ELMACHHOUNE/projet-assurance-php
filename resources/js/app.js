window.$ = window.jQuery = require("jquery");

/* select for motif oui OU non*/
$("#myselect1").on("change", function (e) {
  var optionSelected = $("option:selected", this);
  var valueSelected = this.value;
  if (this.value == "NON") {
    $("#motif").hide();
    $("#myselect2").hide();
  } else {
    $("#motif").show();
    $("#myselect2").show();
  }
});

/*----------------------key up form--------------------------*/

/*----------------------key up form--------------------------*/
$("#nom").keyup(function () {
  if ($("#nom").val() == "")
    $("#nom").css({ "border-color": "#c14c4c", "border-style": "groove" });
  else $("#nom").css({ "border-color": "none", "border-style": "none" });
});

$("#prenom").keyup(function () {
  if ($("#prenom").val() == "")
    $("#prenom").css({ "border-color": "#c14c4c", "border-style": "groove" });
  else $("#prenom").css({ "border-color": "none", "border-style": "none" });
});

$("#marque").keyup(function () {
  if ($("#marque").val() == "")
    $("#marque").css({ "border-color": "#c14c4c", "border-style": "groove" });
  else $("#marque").css({ "border-color": "none", "border-style": "none" });
});

$("#code").keyup(function () {
  if ($("#code").val() == "" || $("#code").val().length != 5)
    $("#code").css({ "border-color": "#c14c4c", "border-style": "groove" });
  else $("#code").css({ "border-color": "none", "border-style": "none" });
  var textme = 5 - $(this).val().length;
});

$("#email").keyup(function () {
  var pattern = new RegExp(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i);
  if (pattern.test($("#email").val()))
    $("#email").css({ "border-color": "none", "border-style": "none" });
  else $("#email").css({ "border-color": "#c14c4c", "border-style": "groove" });
});

$("#tele").keyup(function () {
  if ($("#tele").val() == "" || $("#tele").val().length != 10)
    $("#tele").css({ "border-color": "#c14c4c", "border-style": "groove" });
  else $("#tele").css({ "border-color": "none", "border-style": "none" });

  var textme = 10 - $(this).val().length;
});

/*---------------------------------------------------------- */

$("#bt1").click(function () {
  /*----------------------------------verfication form*/
  if ($("#nom").val() == "") {
    $("#nom").css({ "border-color": "#c14c4c", "border-style": "groove" });
    return false;
  }

  if ($("#prenom").val() == "") {
    $("#prenom").css({ "border-color": "#c14c4c", "border-style": "solid" });
    return false;
  }

  if ($("#marque").val() == "") {
    $("#marque").css({ "border-color": "#c14c4c", "border-style": "solid" });
    return false;
  }

  if ($("#myselect00").val() == "") {
    $("#myselect00").css({
      "border-color": "#c14c4c",
      "border-style": "solid",
    });
    return false;
  }

  if ($("#myselect0").val() == "") {
    $("#myselect0").css({ "border-color": "#c14c4c", "border-style": "solid" });
    return false;
  }

  if ($("#myselect1").val() == "") {
    $("#myselect1").css({ "border-color": "#c14c4c", "border-style": "solid" });
    return false;
  }

  if ($("#code").val() == "" || $("#code").val().length != 5) {
    $("#code").css({ "border-color": "#c14c4c", "border-style": "groove" });
    return false;
  }

  if ($("#tele").val() == "" || $("#tele").val().length != 10) {
    $("#tele").css({ "border-color": "#c14c4c", "border-style": "groove" });
    return false;
  }

  if ($("#email").val() == "") {
    $("#email").css({ "border-color": "#c14c4c", "border-style": "solid" });
    return false;
  }

  if (!pattern.test($("#email").val())) {
    $("#email").css({ "border-color": "#c14c4c", "border-style": "groove" });
    return false;
  }
});

$(document).ready(function () {
  setInterval('$(".myicon").fadeOut(900).fadeIn(800)', 800);
});

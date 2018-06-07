var user, pass;

$(document).ready(function(){

  //  var sesionAbierta = sessionStorage.getItem("sesionAbierta");
  var sesionAbierta = localStorage.getItem("sesionAbierta");
  if(sesionAbierta){
    //Redirigir al Dashboard
    login();
    window.location.href='/dash';
  }
  else {
    //alert("false sesion");
  }
  $('.form-control').keypress(function(){
      $('.log-status').removeClass('wrong-entry');
  });
});







var idUsuarioLogin;

function RecuperarClave(){
  //Guardar valores del formulario
  var correo = $('#txt-correo').val();
  //Post para recuper contraseña con el servicio
  $.post( "https://audiguayaquil.com/SERVICE/comprobar-correo.php",
    { correo: correo })
    .done(function( data ) {
      alert(data.estado);
      if(data.estado==1){//Correo si esta registrado
        alert("Revise su correo electrónico para ver su contraseña. Luego ingrese nuevamente");
        //Redirigir al Log in
        window.location.href='/';
      }
      else if (data.estado==0){// Correo no registrado
        alert("Este correo electrónico no está registrado en este sitio web");
      }
    })
    .fail(function() {
      alert( "Ocurrió un error al intentar ingresar al sitio Web" );
    });
}

function login(){
  if(localStorage.getItem("sesionAbierta")){
    user= localStorage.setItem("usuario",user);
    pass= localStorage.setItem("pass",pass);
  }
  //Guardar valores del formulario
  if($('#txt-user').val()!=""){
    user = $('#txt-user').val();
  }
  if($('#txt-pass').val()!=""){
    pass = $('#txt-pass').val();
  }

  //Post para logearme con el servicio
$.post('https://audiguayaquil.com/SERVICE/log-in.php',{
    user_FB: user,
    user_pass: pass,
    navegador: 1 //solo para web
  })
  .done(function( data ) {
    console.log("DONE CONEXION CON LOGIN");
    if(data.estado==1){//Usuario y contraseña correcta
      if(data.tipo==1){// tipo 1 es Administrador

      //Guardar datos en Local Storage
      localStorage.setItem("nombre",data.name);//Recibo Name, nombre usa en App
      localStorage.setItem("apellido",data.apellido);
      localStorage.setItem("correo",data.correo);
      localStorage.setItem("telefono",data.telefono);
      localStorage.setItem("imgUrl",data.imagen)
      localStorage.setItem("usuario",user);
      localStorage.setItem("pass",pass);
      localStorage.setItem("tipo",data.tipo);
      localStorage.setItem("id",data.id);
      sessionStorage.setItem("sesionActual",true);
      localStorage.setItem("sesionAbierta",true);
      //Redirigir al Dashboard
      window.location.href='/dash';
      }
      else{
        alert("Este servicio es solo para administradores. Si eres uno, por favor, ingresa con las credenciales de administrador")
      }
    }
    else if (data.estado==2){ //Contraseña equivocada
      if($('#txt-user').val()==""||$('#txt-pass').val()==""){
        alert("Debe volver a iniciar sesión porque la contraseña ya no es la misma");
      }
      else{
        $('.log-status').addClass('wrong-entry');
        $('.alert').fadeIn(500);
        setTimeout( "$('.alert').fadeOut(1500);",3000 );
      }

    }
    else if(data.estado==0){
      alert(data.mensaje);
    }
  })
  .fail(function(e) {
      alert( "Ocurrió un error al intentar ingresar al sitio Web" );
   });
}

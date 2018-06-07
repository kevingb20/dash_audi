//Variables del Usuario
var imgUrl, imgUsuario,nombreUsuario,apellidoUsuario,correoUsuario,telefonolUsuario,
 usuarioUsuario, passUsuario,tipoUsuario,idUsuario,NuevoUsuario;
//Variables de los Datatables
var urlCDNspanishDataTable="http://cdn.datatables.net/plug-ins/1.10.16/i18n/Spanish.json";
var idAdministradorSeleccionado, nombreAdministradorSeleccionado;
var idValetSeleccionado, nombreValetSeleccionado;
var tblAdministrador, tblValet;
var tblCitas1, tblCitas2, tblCitas3, tblCitas4, tblSeminuevo, tblCitasEliminadas;
var idCita1, idCita2, idCita3, idCita4, idSeminuevo;
//Variables del Mapa
var map;
var markers1=[];//Por entregar
var markers2=[];//Por recibir
var markers3=[];//Por entregar sin asignar Valet
//Otras Variables
const sitioUrl="https://audiguayaquil.com/SERVICE/";
var sesionAbierta;
var fechaDP;//fecha del date picker
var cargadoSelectValets=false;
var cargadoSelectModelos=false;
var ultimaUID;//Para gestionar el guardado de empleados en firebase
var urlImgSeminuevo1,urlImgSeminuevo2,urlImgSeminuevo3,urlImgSeminuevo4;
var img1cargada=false,img2cargada=false,img3cargada=false,img4cargada=false;
//Reportes
var rMeses=[];
var rMesesPrecios=[];
var rMesesCantidad1=[],rMesesCantidad2=[];
var rDias=[];
var rDiasPrecios=[];
var rDiasCantidad1=[],rDiasCantidad2=[];
var rHorasCantidad=[];
var rAutos=[];
var rFechasZ=[];
//***************************** G E N E R A L **********************************
$(document).ready(function() {
  sesionAbierta = localStorage.getItem("sesionAbierta");
  nombreUsuario = localStorage.getItem("nombre");
  apellidoUsuario = localStorage.getItem("apellido");
  correoUsuario = localStorage.getItem("correo");
  telefonoUsuario = localStorage.getItem("telefono");
  usuarioUsuario = localStorage.getItem("usuario");
  passUsuario = localStorage.getItem("pass");
  tipoUsuario = localStorage.getItem("tipo");
  idUsuario = localStorage.getItem("id");
  if(!sesionAbierta){// Si no esta abierta la sesion
    //Redirigir al login
    window.location.href='/';
  }
  else {
    imgUrl = localStorage.getItem("imgUrl");
    if(imgUrl!=null&&imgUrl!=""){
      //Poner imagen en el sidebar
      imgUsuario=sitioUrl+imgUrl;
    }
    else {
      imgUsuario=sitioUrl+"img-dashboard/perfilNuevo.png"
    }

    $('#img-admin').attr("src",imgUsuario);
    //poner Nombre en el Sidebar
    $('#txtNombre').html(nombreUsuario);
    //poner Tipo en el Sidebar
    if(tipoUsuario==1)
    $('#txtTipo').html("Administrador");
    else if (tipoUsuario==3)
    $('#txtTipo').html("Valet");
  }
  console.log("FIREBASE APPS:"+firebase.apps.length);
  CargarCitasGrafico();
  $(".menuBtn").attr("src",sitioUrl+"img-dashboard/glyphicons/menu-hamburger.png");
  $(".imgSN").attr("src",sitioUrl+"img-dashboard/camara-preview.png");

});

function AccionesNotificaciones(codn,title,body){

  console.log("CODN: "+codn);

  toastr.options ={
    "closeButton" : true,
    "showMethod" : 'slideDown'
  };

  if(codn==1){//Alguien separo o elimino una cita
    if(tblCitas1!=null){
      tblCitas1.ajax.reload();
    }
    CargarCitasGrafico();
    RecargarMapa();
    toastr.options.onclick = function() {
      irPagina("citasPorRecibir");
    }
  }
  else if(codn==2){//LLego al zentrum
    if(tblCitas1!=null){
      tblCitas1.ajax.reload();
    }
    if(tblCitas2!=null){
      tblCitas2.ajax.reload();
    }
    CargarCitasGrafico();
    toastr.options.onclick = function() {
      irPagina("citasPorReparar");
    }

  }
  else if(codn==3){//Se asigno lugar de entrega
    if(tblCitas3!=null){
      tblCitas3.ajax.reload();
    }
    toastr.options.onclick = function() {
      irPagina("citasPorEntregar");
    }
  }
  else if(codn==4){//Se asigno lugar de entrega
    if(tblCitas4!=null){
      tblCitas4.ajax.reload();
    }
    CargarCitasGrafico();
    toastr.options.onclick = function() {
      irPagina("citasFinalizadas");
    }
  }
  else if (codn==5){//Cambio contraseña en otro lado
    alert("Ha cambiado la contraseña en otro sitio, Debe volver a ingresar para continuar");
    //Remover local storage para que tenga que volver a iniciar sesion
    localStorage.removeItem("sesionAbierta");
    //Cerrar sesion con firebase
    firebase.auth().signOut();
    //Redirigir a la pagina principal
    window.location.href='/';
  }
  else if(codn==6){//Inicio sesion en otro navegador
    console.log("inicio OTRO NAVEGADOR");
    alert("Ha iniciado sesión en otro sitio. Debe volver a ingresar para continuar");
    //Remover local storage para que tenga que volver a iniciar sesion
    localStorage.removeItem("sesionAbierta");
    //Cerrar sesion con firebase
    firebase.auth().signOut();
    //Redirigir a la pagina principal
    window.location.href='/';
  }
  //Mostrar Alerta Toast
  toastr.info(body,title);
}

function ActualizarTokenWeb(token){
  //Tipo 1 Administrador
  console.log("idUsuario:"+idUsuario);
  $.post(sitioUrl+"ActualizarTokenWeb.php",{
    id:idUsuario,//Finalizadas
    token:token,
    tipo:1
   })
    .done(function( data ) {
      if(data.estado==1){//Si hay citas para mostrar

        console.log("Token actualizado:"+token);
      }
      else {
        console.log(data.mensaje);
      }

    })
    .fail(function() {
      MostrarAlerta("msg_mapa","danger","Ha ocurrido un error al actualizar token");
      return;
    });
}

function MensajeFirebase(){
  $.post('/enviarMensaje',
  {
    mensaje: ("MENSAJE ENVIADO")
  })
  .done(function(){
    //EliminarEmpleadoBD(idSeleccionado,tipo);
    console.log("Si se envio al index.js el post");
  })
  .fail(function() {
    console.log("No se envio al index.js el post");
  });
}

function MostrarAlerta(nombreDiv,tipo,mensaje){
  //Remover todas las clases antes al mensaje
  $("#"+nombreDiv).removeClass("alert-success");
  $("#"+nombreDiv).removeClass("alert-warning");
  $("#"+nombreDiv).removeClass("alert-info");
  $("#"+nombreDiv).removeClass("alert-danger");

  $("#"+nombreDiv).text(mensaje);
  $("#"+nombreDiv).addClass("alert-"+tipo);
  $("#"+nombreDiv).fadeIn(300,function(){
    setTimeout(function(){
      $("#"+nombreDiv).fadeOut(1000);//Ocultar mensaje
    },2000);//Esperar 2 segundos antes de ocultar mensaje
  });
}

function MostrarOcultarMenu(){
  $('#sidebar').toggleClass('active');
}

function irPagina(pagina){
  //Cambiar clase de botones del Side bar
  $('.active li').removeClass("active");
  //ocultar todas las paginas
  $('.dash-pagina').hide();
  //mostrar solo esta
  $('#'+pagina+'').show();
  //Remover de los li del sidebar la clase activo
  $('.active').removeClass("active");

  if(pagina=='perfil'){
    //mandar datos para la pagina de Editar perfil
    //mandar el url
    $('#cardImagen').attr("src",imgUsuario);
    //mandar el NOMBRE
    $('#cardNombre').val(nombreUsuario);
    //mandar el APELLIDO
    $('#cardApellido').val(apellidoUsuario);
    //mandar el TIPO
    if(tipoUsuario==1){//Tipo Administrador
      $('#cardTipo').html("Administrador");
    }
    else if(tipoUsuario==3){//Tipo Valet
      $('#cardTipo').html("Valet");
    }
    //mandar el NOMBRE
    $('#cardUsuario').html(usuarioUsuario);
    //mandar el Pass
    //$('#cardPass').val("*************");
    //mandar el TELEFONO
    $('#cardTelefono').val(telefonoUsuario);
    //mandar el CORREO
    $('#cardCorreo').val(correoUsuario);
    return;
  }
  else if (pagina=='eliminarAdministrador'){
    InicializarDataTables(1,"tblAdministrador");
  }
  else if (pagina=='eliminarValet'){
    InicializarDataTables(3,"tblValet");
  }
  else if (pagina=='citasPorRecibir'){
    CargarSelectValets();
    InicializarDataTables(4,"tblCitas1");
  }
  else if (pagina=='citasPorReparar'){
    InicializarDataTables(5,"tblCitas2");
  }
  else if (pagina=='citasPorEntregar'){
    CargarSelectValets();
    InicializarDataTables(6,"tblCitas3");
  }
  else if (pagina=='citasFinalizadas'){
    InicializarDataTables(7,"tblCitas4");
  }
  else if(pagina=='seminuevo'){
    CargarSelectModelos();
    InicializarDataTables(8,"tblSeminuevo");

  }
  else if (pagina=='separarCita'){
    for (var i = 1; i < 5; i++) {//Cambiar las propiedades de todos los botones
        $('#btnBloquear'+i).prop("disabled",true);
        $('#btnBloquear'+i).removeClass("btn-primary");
        $('#btnBloquear'+i).addClass("btn-outline-secondary");
    }
  }
  else if (pagina=='rCitas'){
    CargarAnios(1);

  }
  else if(pagina=='rAuto'){
    CargarAnios(2);
  }
  else if (pagina=='citasEliminadas'){
    InicializarDataTables(9,"tblCitasEliminadas");
  }
  //Para que no ocupe espacio en pantalla el mensaje sin ser mostrado
  //$("#msg_"+pagina).fadeOut();
  //Para que aparezca seleccionado el menu en el sidebar
  $('#li-'+pagina+'').addClass("active");
}

function Salir(){
  var r = confirm("¿Está seguro que desea salir?"); //r de respuesta
  if (r == true) {  // Presiono OK
    //Remover local storage para que tenga que volver a iniciar sesion
    localStorage.removeItem("sesionAbierta");
    //Cerrar sesion con firebase
    firebase.auth().signOut();
    //Redirigir a la pagina principal
    window.location.href='/';
  }
}

//********************** L O G I N - F I R E B A S E ***************************
firebase.auth().onAuthStateChanged(function(user) {
  console.log("Cambio Firebase");
  if (user) {
    // User is signed in.
    var user = firebase.auth().currentUser;
    if(user != null){
      //var email_id = user.email;
      //alert(user.email);
      //alert(user.uid);
      console.log("USER "+user);
    }
  } else {
    console.log("NO USER");

      logFirebase();
    // No user is signed in.
  }
});

function logFirebase(){
  var c = correoUsuario;
  var p = passUsuario;
  firebase.auth().signInWithEmailAndPassword(c, p)
  .then(function(user){
    //Ingresado con exito
    MostrarAlerta("msg_mapa","success","Ingreso exitoso. Bienvenido, "+nombreUsuario);
  })
  .catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    MostrarAlerta("msg_mapa","danger","Ha ocurrido un error: "+errorMessage);
    //  alert("Debe ingresar nuevamente");
      //Remover local storage para que tenga que volver a iniciar sesion
      //  localStorage.removeItem("sesionAbierta");
      //Cerrar sesion con firebase
      //    firebase.auth().signOut();
    //Redirigir a la pagina principal
    //    window.location.href='/';
  });
}

//************************** D A T A T A B L E S *******************************
function InicializarDataTables(tipo,nombre){

  if(tipo==1){//DATATABLE ADMINISTRADOR
    if(!$.fn.DataTable.isDataTable( '#'+nombre+'' )){//Si no ha sido inicializado
      tblAdministrador= $('#'+nombre+'').DataTable({
        //Poner en epañol las opciones del Datatable
        "language": {
          "url": urlCDNspanishDataTable
        },
        //Traer datos para llenar el DataTable
        "processing": true,
        "serverSide": true,
        "ajax": {
          "url": sitioUrl+"listar-empleados.php",
          "type": "POST",
          "data": {"tipo":tipo}//enviar al servicio esta variable
        },
        "columns": [
          { "data": "id" },
          { "data": "nombre" },
          { "data": "usuario" },
          { "data": "correo" }
        ]
      });
      //Controlar click en fila
      $('#tblAdministrador tbody').on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
          $(this).removeClass('selected');
          $('#btnEliminarA').prop("disabled",true);
          $('#btnEliminarA').removeClass("btn-danger");
          $('#btnEliminarA').addClass("btn-outline-secondary")
        }
        else {
          tblAdministrador.$('tr.selected').removeClass('selected');
          $(this).addClass('selected');
          $('#btnEliminarA').prop("disabled",false);
          $('#btnEliminarA').removeClass("btn-outline-secondary");
          $('#btnEliminarA').addClass("btn-danger")
        }
        var d = ( tblAdministrador.row( this ).data() );
        idAdministradorSeleccionado=d.id;
        nombreAdministradorSeleccionado=d.nombre;
        } );
    }
    else {
      //Actualizar la tabla si doy click y ya se inicializo la tabla
      tblAdministrador.ajax.reload();
      $('#btnEliminarA').prop("disabled",true);
      $('#btnEliminarA').removeClass("btn-danger");
      $('#btnEliminarA').addClass("btn-outline-secondary")
    }
  }
  else if (tipo==3){ // DATATABLE VALET
    if(!$.fn.DataTable.isDataTable( '#'+nombre+'' )){//Si no ha sido inicializado
      tblValet= $('#'+nombre+'').DataTable({
        //Poner en epañol las opciones del Datatable
        "language": {
          "url": urlCDNspanishDataTable
        },
        //Traer datos para llenar el DataTable
        "processing": true,
        "serverSide": true,
        "ajax": {
          "url": sitioUrl+"listar-empleados.php",
          "type": "POST",
          "data": {"tipo":tipo}//enviar al servicio esta variable
        },
        "columns": [
          { "data": "id" },
          { "data": "nombre" },
          { "data": "usuario" },
          { "data": "correo" }
        ]
      });
      //Controlar click en fila
      $('#tblValet tbody').on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
          $(this).removeClass('selected');
          $('#btnEliminarV').prop("disabled",true);
          $('#btnEliminarV').removeClass("btn-danger");
          $('#btnEliminarV').addClass("btn-outline-secondary")
        }
        else {
          tblValet.$('tr.selected').removeClass('selected');
          $(this).addClass('selected');
          $('#btnEliminarV').prop("disabled",false);
          $('#btnEliminarV').removeClass("btn-outline-secondary");
          $('#btnEliminarV').addClass("btn-danger")
        }
        var d = ( tblValet.row( this ).data() );
        idValetSeleccionado=d.id;
        nombreValetSeleccionado=d.nombre;
        } );
    }
    else {
      //Actualizar la tabla si doy click y ya se inicializo la tabla
      tblValet.ajax.reload();
      $('#btnEliminarV').prop("disabled",true);
      $('#btnEliminarV').removeClass("btn-danger");
      $('#btnEliminarV').addClass("btn-outline-secondary")
    }
  }
  else if (tipo==4){ // CITAS POR RECIBIR
    if(!$.fn.DataTable.isDataTable( '#'+nombre+'' )){//Si no ha sido inicializado
      tblCitas1= $('#'+nombre+'').DataTable({
        //Poner en epañol las opciones del Datatable
        "language": {
          "url": urlCDNspanishDataTable
        },
        //Traer datos para llenar el DataTable
        "processing": true,
        "serverSide": true,
        "ajax": {
          "url": sitioUrl+"listar-citas.php",
          "type": "POST",
          "data": {"estado":1}//enviar al servicio esta variable
        },
        "columns": [
          { "data": "id" },
          { "data": "lugar" },
          { "data": "fecha" },
          { "data": "placa" },
          { "data": "valet" }
        ]
      });
      //Controlar click en fila
      $('#tblCitas1 tbody').on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
          $(this).removeClass('selected');
          $('#btnAsignarValet').prop("disabled",true);
        }
        else {
          tblCitas1.$('tr.selected').removeClass('selected');
          $(this).addClass('selected');
          $('#btnAsignarValet').prop("disabled",false);
        }

          var d = ( tblCitas1.row( this ).data() );
          idCita1=d.id;

      //  nombreValetSeleccionado=d.nombre;
      } );
    }
    else {
      //Actualizar la tabla si doy click y ya se inicializo la tabla
      tblCitas1.ajax.reload();
      $('#btnAsignarValet').prop("disabled",true);

    }
  }
  else if (tipo==5){ // CITAS POR REPARAR
    if(!$.fn.DataTable.isDataTable( '#'+nombre+'' )){//Si no ha sido inicializado
      tblCitas2= $('#'+nombre+'').DataTable({
        //Poner en epañol las opciones del Datatable
        "language": {
          "url": urlCDNspanishDataTable
        },
        //Traer datos para llenar el DataTable
        "processing": true,
        "serverSide": true,
        "ajax": {
          "url": sitioUrl+"listar-citas.php",
          "type": "POST",
          "data": {"estado":2}//enviar al servicio esta variable
        },
        "columns": [
          { "data": "id" },
          { "data": "descripcion" },
          { "data": "precio" },
          { "data": "placa" },
          { "data": "kilometraje" },
          { "data": "fZentrum" }
        ],
        //TRUNCAR LONGITUD DE LA DESCRIPCION
        "columnDefs": [ {
        "targets": 1,
        render: function ( data, type, row ) {
            return data.substr( 0, 40);
        }
    } ]
      });

      //Controlar click en fila

      $('#tblCitas2 tbody').on( 'click', 'tr', function () {



        if ( $(this).hasClass('selected') ) {
          $(this).removeClass('selected');
          $('#btnModificarMantenimiento').prop("disabled",true);
          $('#inputDescripcion').prop("disabled",true);
          $('#inputPrecio').prop("disabled",true);
          $('#inputKilometraje').prop("disabled",true);
        }
        else {

          tblCitas2.$('tr.selected').removeClass('selected');
          $(this).addClass('selected');
          $('#btnModificarMantenimiento').prop("disabled",false);
          $('#inputDescripcion').prop("disabled",false);
          $('#inputPrecio').prop("disabled",false);
          $('#inputKilometraje').prop("disabled",false);

        }
          var d = ( tblCitas2.row( this ).data() );
          //Guardar datos del datatable en inputs
          //  console.log("undefined");
            $('#inputDescripcion').val(d.descripcion);
            $('#inputPrecio').val(d.precio);
            $('#inputKilometraje').val(d.kilometraje);
            idCita2=d.id;
      } );
    }
    else {
      //Actualizar la tabla si doy click y ya se inicializo la tabla
      tblCitas2.ajax.reload();
      $('#btnModificarMantenimiento').prop("disabled",true);
    }
  }
  else if (tipo==6){ // CITAS POR Entregar
    if(!$.fn.DataTable.isDataTable( '#'+nombre+'' )){//Si no ha sido inicializado
      tblCitas3= $('#'+nombre+'').DataTable({
        //Poner en epañol las opciones del Datatable
        "language": {
          "url": urlCDNspanishDataTable
        },
        //Traer datos para llenar el DataTable
        "processing": true,
        "serverSide": true,
        "ajax": {
          "url": sitioUrl+"listar-citas.php",
          "type": "POST",
          "data": {"estado":3}//enviar al servicio esta variable
        },
        "columns": [
          { "data": "id" },
          { "data": "lugar" },
          { "data": "fecha" },
          { "data": "placa" },
          { "data": "valet" }
        ]
      });
      //Controlar click en fila
      $('#tblCitas3 tbody').on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
          $(this).removeClass('selected');
          $('#btnAsignarValet2').prop("disabled",true);
        }
        else {
          tblCitas3.$('tr.selected').removeClass('selected');
          $(this).addClass('selected');
          $('#btnAsignarValet2').prop("disabled",false);
        }

          var d = ( tblCitas3.row( this ).data() );
          idCita3=d.id;

      //  nombreValetSeleccionado=d.nombre;
      } );
    }
    else {
      //Actualizar la tabla si doy click y ya se inicializo la tabla
      $('#btnAsignarValet2').prop("disabled",true);
      tblCitas3.ajax.reload();
    }
  }
  else if (tipo==7){ // CITAS POR Finalizadas
    if(!$.fn.DataTable.isDataTable( '#'+nombre+'' )){//Si no ha sido inicializado
      tblCitas4= $('#'+nombre+'').DataTable({
        //Poner en epañol las opciones del Datatable
        "language": {
          "url": urlCDNspanishDataTable
        },
        //Traer datos para llenar el DataTable
        "processing": true,
        "serverSide": true,
        "ajax": {
          "url": sitioUrl+"listar-citas.php",
          "type": "POST",
          "data": {"estado":4}//enviar al servicio esta variable
        },
        "columns": [
          { "data": "id" },
          { "data": "precio" },
          { "data": "descripcion" },
          { "data": "kilometraje" },
          { "data": "fecha" },
          { "data": "placa" },
          { "data": "valet" }
        ],
        //TRUNCAR LONGITUD DE LA DESCRIPCION
        "columnDefs": [ {
        "targets": 2,
        render: function ( data, type, row ) {
            return data.substr( 0, 20);
        }
    } ]
      });

      //Controlar click en fila
      $('#tblCitas4 tbody').on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
          $(this).removeClass('selected');

          $('#inputDescripcion2').val("");
          $('#inputPrecio2').val("");
          $('#inputKilometraje2').val("");
          $('#inputValet').val("");
        }
        else {
          tblCitas4.$('tr.selected').removeClass('selected');
          $(this).addClass('selected');

            var d = ( tblCitas4.row( this ).data() );
            //Guardar datos del datatable en inputs
            $('#inputDescripcion2').val(d.descripcion);
            $('#inputPrecio2').val(d.precio);
            $('#inputKilometraje2').val(d.kilometraje);
            idCita4=d.id;

          CargarNombreValet(d.valet);
        }
      } );
    }
    else {
      //Actualizar la tabla si doy click y ya se inicializo la tabla
      tblCitas4.ajax.reload();
    }
  }
  else if (tipo==8){ // SEMINUEVOS
    if(!$.fn.DataTable.isDataTable( '#'+nombre+'' )){//Si no ha sido inicializado
      tblSeminuevo= $('#'+nombre+'').DataTable({
        //Poner en epañol las opciones del Datatable
        "language": {
          "url": urlCDNspanishDataTable
        },
        //Traer datos para llenar el DataTable
        "processing": true,
        "serverSide": true,
        "ajax": {
          "url": sitioUrl+"listar-seminuevos.php",
          "type": "POST",
          "data": {}//enviar al servicio esta variable
        },
        "columns": [
          { "data": "id" },
          { "data": "placa" },
          { "data": "precio" },
          { "data": "km" },
          { "data": "anio" }
        ],
        //TRUNCAR LONGITUD DE LA DESCRIPCION

      });
      //Controlar click en fila
      $('#tblSeminuevo tbody').on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {//DESELECCIONAR
          $(this).removeClass('selected');
          AcomodarBotones(2);
          LimpiarSeminuevo();
          idSeminuevo="";
        }
        else { //SELECCIONAR
          tblSeminuevo.$('tr.selected').removeClass('selected');
          $(this).addClass('selected');
          var d = ( tblSeminuevo.row( this ).data() );
          idSeminuevo=d.id;
          AcomodarBotones(1);
          CargarDatosSeminuevo(idSeminuevo);
        }
      } );
    }
    else {
      //Actualizar la tabla si doy click y ya se inicializo la tabla
      tblSeminuevo.ajax.reload();
    }
  }
  else if (tipo==9){ // CITAS ELIMINADAS
    if(!$.fn.DataTable.isDataTable( '#'+nombre+'' )){//Si no ha sido inicializado
      tblCitasEliminadas= $('#'+nombre+'').DataTable({
        //Poner en epañol las opciones del Datatable
        "language": {
          "url": urlCDNspanishDataTable
        },
        //Traer datos para llenar el DataTable
        "processing": true,
        "serverSide": true,
        "ajax": {
          "url": sitioUrl+"listar-citas-eliminadas.php",
          "type": "POST",
          "data": {}//enviar al servicio
        },
        "columns": [
          { "data": "fecha" },
          { "data": "placa" },
          { "data": "cliente" }
        ],
        "order": [ 0, 'desc' ]

      }
    );

      //Controlar click en fila
      $('#tblCitasEliminadas tbody').on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
          $(this).removeClass('selected');

        }
        else {
          tblCitasEliminadas.$('tr.selected').removeClass('selected');
          $(this).addClass('selected');
        }
      } );
    }
    else {
      //Actualizar la tabla si doy click y ya se inicializo la tabla
      tblCitasEliminadas.ajax.reload();
    }
  }
}

//**************************** R E P O R T E S *********************************

function CargarAnios(tipo){
  var rAnios =[];
  var ultimoAnio=0;
  //console.log("ANTES DE CONSULTAR ANIO. Tipo:"+tipo);
  $.post(sitioUrl+"reporte-citas"+tipo+".php",{
    estado:4,//Finalizadas y si es tipo 2 solo se ignora en el post
    anio:"",
    mes:""
   })
    .done(function( data ) {
      if(data.estado==1){//Si hay citas para mostrar
        //Vaciar Select slcAnios antes de llenarlo
        $("#slcAnios"+tipo).empty();
        //Primera vez
        $.each(data.citas,function(key, registro) {
        //  var anio = jQuery.trim(registro.fecha).substring(0, 4);//Truncar solo el anio
          var anio = (registro.fecha).split("-",1)//
          anio=anio[0];
          if(ultimoAnio!=anio){//Guardar solo un anio diferente
            //console.log("Fecha:"+shortText);
            ultimoAnio=anio;
            rAnios.push(ultimoAnio);
            //rAnios.push(ultimoAnio);
            $("#slcAnios"+tipo).append('<option value='+ultimoAnio+'>'+ultimoAnio+'</option>');
          }
        //  console.log("Precio:"+registro.precio);
      });
      //console.log("Arreglo rAnios:"+rAnios);
      }
      ConsultarMes(tipo);
    })
    .fail(function() {
      MostrarAlerta("msg_rCitas","danger","Ocurrió un error al intentar cargar citas Finalizadas");
      return;
    });
}

function ConsultarMes(tipo){
  //Primero mandar a bloquera el SLC mes y boton
  $("#slcMeses"+tipo).prop("disabled",true);
  $("#btnConsultarRCitas"+tipo).prop("disabled",true);
  var optionSelected = $('#slcAnios'+tipo).find("option:selected");
  var valueSelected  = optionSelected.val();
  var textSelected   = optionSelected.text();
  CargarMeses(textSelected,tipo);
}

function CargarMeses(anio,tipo){
  var ultimoMes=0;
  var precio=0;
  var cantidad=0;
  rMeses=[];
  //console.log("CargarMeses"+anio);
  console.log("ANTES DE CONSULTAR MES. Tipo:"+tipo);
  $.post(sitioUrl+"reporte-citas"+tipo+".php",{
    estado:4,//Finalizadas
    anio:anio,
    mes:""
   })
    .done(function( data ) {
      if(data.estado==1){//Si hay citas para mostrar
        //Vaciar Select slcMeses antes de llenarlo
        $("#slcMeses"+tipo).empty();
        $("#slcMeses"+tipo).append('<option value='+0+'>'+"Todo el año"+'</option>');

        $.each(data.citas,function(key, registro) {
          var mes = (registro.fecha).split("-",2)//
          mes=mes[1];

          if(ultimoMes!=mes){
            console.log("ultimo mes: "+ultimoMes+" diferente de mes: "+mes);
              ultimoMes=mes;
              rMeses.push(ultimoMes);
              precio=0;
              cantidad=0;
          }
          if(ultimoMes==mes){

            if(tipo==1){

              precio+=registro.precio;
              precio=Math.round(precio*100)/100;
              window[ultimoMes+"MPrecio"]=precio;
            }
            cantidad++;

            window[ultimoMes+"MCantidad"+tipo]=cantidad;

          }
          //console.log("Precio:"+registro.precio);
      });
      //console.log("mcantidad"+window[ultimoMes+"MCantidad"]);
      LlenarMeses(rMeses,tipo);
      }
    })
    .fail(function() {
      if(tipo==1){
        MostrarAlerta("msg_rCitas","danger","Ocurrió un error al intentar cargar citas Finalizadas");
      }else {
        MostrarAlerta("msg_rAutos","danger","Ocurrió un error al intentar cargar la fecha de llegada de autos al zentrum");
      }
      return;
    });
}

function LlenarMeses(rMeses,tipo){
  //ordenar el arreglo
  rMeses.sort(function(a, b){return b-a});//b-a=DESC || a-b = ASC
  $.each(rMeses, function( index, value ) {
    $("#slcMeses"+tipo).append('<option value='+value+'>'+MesPorNumero(value)+'</option>');
  });
  rMeses.sort(function(a, b){return a-b});//b-a=DESC || a-b = ASC
  if(tipo==1){
    rMesesPrecios=[];
  }
  window["rMesesCantidad"+tipo]=[];

  $.each(rMeses, function( index, value ) {
    if(tipo==1){
    rMesesPrecios.push(window[value+"MPrecio"]);
    }
    window["rMesesCantidad"+tipo].push(window[value+"MCantidad"+tipo]);
  });
  //Cuando termine de cargarse volver a habilitar el boton
  $("#slcMeses"+tipo).prop("disabled",false);
  $("#btnConsultarRCitas"+tipo).prop("disabled",false);
}

function MesPorNumero(num){
  if(num==1||num==01){
    return "Enero";
  }
  else if(num==2||num=="02"){
    return "Febrero";
  }else if(num==3||num=="03"){
    return "Marzo";
  }else if(num==4||num=="04"){
    return "Abril";
  }else if(num==5||num=="05"){
    return "Mayo";
  }else if(num==6||num=="06"){
    return "Junio";
  }else if(num==7||num=="07"){
    return "Julio";
  }else if(num==8||num=="08"){
    return "Agosto";
  }else if(num==9||num=="09"){
    return "Septiembre";
  }else if(num==10){
    return "Octubre";
  }else if(num==11){
    return "Noviembre";
  }else if(num==12){
    return "Diciembre";
  }
}

function ConsultarDia(tipo){
  $("#btnConsultarRCitas"+tipo).prop("disabled",true);
  var optionSelected = $('#slcAnios'+tipo).find("option:selected");
  var textSelected   = optionSelected.text();
  var optionSelected2 = $('#slcMeses'+tipo).find("option:selected");
  var textSelected2   = optionSelected2.val();
  if(textSelected2==0){
    CargarMeses(textSelected,tipo);
  }
  else{
    CargarDias(textSelected,textSelected2,tipo);
  }

}

function CargarDias(anio,mes,tipo){
  var ultimoDia=0;
  var precio=0;
  var cantidad=0;
  rDias=[];
  $.post(sitioUrl+"reporte-citas"+tipo+".php",{
    estado:4,//Finalizadas
    anio:anio,
    mes:mes
   })
    .done(function( data ) {
      //console.log("ANIOMES"+anio+"-"+mes);
      if(data.estado==1){//Si hay citas para mostrar
        //Vaciar Select slcMeses antes de llenarlo

        $.each(data.citas,function(key, registro) {
          var f = (registro.fecha).split("-",3)//
          var seleccion=f[2];//Coger A partir del tercer
          var dia=Math.abs(seleccion.split(" ",1));//Truncar solo el dia
          //dia+=dia;
          if(ultimoDia!=dia){
            //console.log("ULTIMO"+ultimoDia+"DIA"+dia);
            ultimoDia=dia;
            rDias.push(ultimoDia);
            precio=0;
            cantidad=0;

          }
          if(ultimoDia==dia){
            if(tipo==1){
              precio+=registro.precio;
              precio=Math.round(precio*100)/100;
              window[ultimoDia+"DPrecio"]=precio;
            }
            cantidad++;
            window[ultimoDia+"DCantidad"+tipo]=cantidad;
            //console.log(window[ultimoDia+"DPrecio"]);
          }
          //console.log("Dia"+dia+" ||Precio:"+precio);
      });
      //console.log("Dias:"+rDias);

      LlenarDias(rDias,tipo);
      }
    })
    .fail(function() {
      MostrarAlerta("msg_rCitas","danger","Ocurrió un error al intentar cargar citas Finalizadas");
      return;
    });
}

function LlenarDias(rDias,tipo){
  //ordenar el arreglo

  rDias.sort(function(a, b){return a-b});//b-a=DESC || a-b = ASC
  if(tipo==1){
    rDiasPrecios=[];
  }
  window["rDiasCantidad"+tipo]=[];
  $.each(rDias, function( index, value ) {
    if(tipo==1){
      rDiasPrecios.push(window[value+"DPrecio"]);
    }
    window["rDiasCantidad"+tipo].push(window[value+"DCantidad"+tipo]);
  });
  $("#btnConsultarRCitas"+tipo).prop("disabled",false);
}

function ConsultarReportes(tipo){
  var optionSelected,esMes=true,esCantidad=true,datosX,datosY;
  if(tipo==1){//pagina rCitas
    optionSelected = $('#slcTipoR1').find("option:selected");
    if($('#slcMeses'+tipo).val()==0){//Todo el año
      datosX=rMeses;
      if(optionSelected.val()==1){//Precios de citas
        esCantidad=false;
        datosY=rMesesPrecios;
      }else{//==2 Cantidad de citas
        datosY=rMesesCantidad1
      }
    }
    else{//Dias del mes
      esMes=false;
      datosX=rDias;
      if(optionSelected.val()==1){//Precios de citas
        esCantidad=false;
        datosY=rDiasPrecios;
      }else{//==2 Cantidad de citas
        datosY=rDiasCantidad1
      }
    }
    MostrarReporteCitas(esMes,esCantidad,datosX,datosY,tipo);
  }


  else {//Pagina rAutos
    if($('#slcMeses'+tipo).val()==0){//Todo el año
      datosX=rMeses;
      datosY=rMesesCantidad2;
    }
    else{//Dias del mes
      esMes=false;
      datosX=rDias;
      datosY=rDiasCantidad2;
    }
    MostrarReporteCitas(esMes,esCantidad,datosX,datosY,tipo);
  }


}

function MostrarReporteCitas(esMes,esCantidad,datosX,datosY,tipo){
  console.log("datosX: "+datosX);
  console.log("datosY: "+datosY);
  //Vaciar Canvas antes de crear el siguiente
   $( "#wCanvas"+tipo ).empty().append( "<canvas id='chart-"+tipo+"'></canvas>" );

  var SAMPLE_INFO = {
  			group: 'Charts',
  			name: 'Bar',
  		};
  var DATA_COUNT = datosX.length;
  var labels = [];
  Samples.srand(2);
  for (var i = 0; i < DATA_COUNT; ++i) {
    if(esMes)
      labels.push(MesPorNumero(rMeses[i]));//Nombre label eje x
    else {
      labels.push(rDias[i]);//Nombre label eje x
    }
  }
  //Tamaño
  Chart.helpers.merge(Chart.defaults.global, {
    aspectRatio: 4/3,
    tooltips: false,
    layout: {
      padding: {
        top: 42,
        right: 16,
        bottom: 32,
        left: 8
      }
    },
    elements: {
      line: {
        fill: false
      },
      point: {
        hoverRadius: 7,
        radius: 5
      }
    },
    plugins: {
      legend: false,
      title: false
    }
  });
  /////
  var chart = new Chart(('chart-'+tipo), {
			type: 'bar',
			data: {
				labels: labels,
				datasets: [{
					backgroundColor: Samples.color(tipo),
					data: datosY,
					datalabels: {
						align: 'end',
						anchor: 'start'
					}
				}]
			},
			options: {
        events: ['click'],
				plugins: {
					datalabels: {
						color: '#052660',
						display: function(context) {
            //  console.log("CONTEXT: "+context)
							return context.dataset.data[context.dataIndex] > 0;//>15
						},
						font: {
							weight: 'bold'
						},
						//formatter: Math.round(2)
					}
				},
				scales: {
					xAxes: [{
						stacked: true
					}],
					yAxes: [{

						stacked: true,
            ticks: {
                   // Include a dollar sign in the ticks
                   callback: function(value, index, values) {
                     if(esCantidad){
                       return (Math.round(value*100)/100);
                     }
                     if(tipo==1){
                       return '$' + (Math.round(value*100)/100);
                     }

                   }
               }
					}]
				}
			}
		});
}

function CargarCitasGrafico(){
  var cantidadCitas=[];
  //Recibir
  $.post(sitioUrl+"citas-estado.php",{
    estado:"recibir",//recibir
    estado_cita_app:null
   })
    .done(function( data ) {
      if(data.estado==2){//Si hay citas para mostrar
        cantidadCitas[0]=(data.citas.length);
      }
      else if(data.estado==1){//No hay
        cantidadCitas[0]=(0);
      }
      MostrarGraficoMenu(cantidadCitas);
    })
    .fail(function() {
      MostrarAlerta("msg_mapa","danger","Ocurrió un error al intentar cargar citas para el gráfico");
      return;
    });

  //Reparar
  $.post(sitioUrl+"citas-estado.php",{
    estado:"reparacion",//recibir
    estado_cita_app:null
   })
    .done(function( data ) {
      if(data.estado==2){//Si hay citas para mostrar
        cantidadCitas[1]=(data.citas.length);
      }
      else if(data.estado==1){//No hay
        cantidadCitas[1]=(0);
      }
      MostrarGraficoMenu(cantidadCitas);
    })
    .fail(function() {
      MostrarAlerta("msg_mapa","danger","Ocurrió un error al intentar cargar citas para el gráfico");
      return;
    });

  //Entregar
  $.post(sitioUrl+"citas-estado.php",{
    estado:"entregado",//recibir
    estado_cita_app:null
   })
    .done(function( data ) {
      if(data.estado==2){//Si hay citas para mostrar
        cantidadCitas[2]=(data.citas.length);
      }
      else if(data.estado==1){//No hay
        cantidadCitas[2]=(0);
      }
      MostrarGraficoMenu(cantidadCitas);
      //console.log("0--->"+cantidadCitas[0]);
    //  console.log("1--->"+cantidadCitas[1]);
    //  console.log("2--->"+cantidadCitas[2]);
    })
    .fail(function() {
      MostrarAlerta("msg_mapa","danger","Ocurrió un error al intentar cargar citas para el gráfico");
      return;
    });
}

function MostrarGraficoMenu(cantidadCitas){

  //Vaciar Canvas antes de crear el siguiente
  $( "#wCanvasSideBar" ).empty().append( "<canvas id='chart-Sidebar'></canvas>" );
  //  var cantidadCitas=[2,3,1];
  //console.log(cantidadCitas);
  var ctx = $("#chart-Sidebar");
  var data = {
    datasets: [{
        data: cantidadCitas,
        label:"Citas",
        backgroundColor: ['#ff6384','#36a2eb','#cc65fe']
    }],
    labels: [
        'Recibir',
        'Reparar',
        'Entregar'
    ]
  };
  var menuChart = new Chart(ctx, {
    type: 'horizontalBar',
    data: data,
    options: {
      plugins: {
        datalabels: {
          color: '#FFF',
          display: function(context) {
            return context.dataset.data[context.dataIndex] > 0;//>15
          },
          font: {
            weight: 'bold'
          },
          formatter: Math.round
        }
      },
      scales: {
        xAxes: [{
          display: false
        }],
        yAxes: [{
          stacked: true

        }]
      },
      legend: {
          labels: {
              // This more specific font property overrides the global property
              fontColor: 'white'
          }
      }
      //events: ['click'],
    }
  });
}

function CargarAutoReparando(){
  rAutos=[];
  rFechasZ=[];
  $.post(sitioUrl+"reporte-autos.php",{
    estado:2,//En repacion
   })
    .done(function( data ) {
      if(data.estado==1)
      {//Si hay citas para mostrar
        $.each(data.citas,function(key, registro) {
          var f = (registro.fechaZ).split("-",3)//
          var seleccion=f[2];//Coger A partir del tercer
          var dia=Math.abs(seleccion.split(" ",1));//Truncar solo el dia

      });

    }else if(estado==2){
      MostrarAlerta("msg_rAutos","warning","Ocurrió un error al intentar cargar los autos en el taller");
      return;
    }
    })
    .fail(function() {
      MostrarAlerta("msg_rAutos","danger","Ocurrió un error al intentar cargar los autos en el taller");
      return;
    });
}

//****************************** C I T A S *************************************

function CargarNombreValet(id){
  $.post(sitioUrl+"listar-valet.php",{

   })
    .done(function( data ) {
      //Llenar los valets
      $.each(data.valets,function(key, registro) {
        if(id==registro.id){
          $("#inputValet").val(registro.nombre);
        }
      });
    })
    .fail(function() {
      MostrarAlerta("msg_citasFinalizadas","warning","Ha ocurrido un error al intentar cargar el nombre del valet");
      return;
    });
}

function CargarSelectValets(tipo){
  if(!cargadoSelectValets){// Solo se carga por primera vez
      //POST
    $.post(sitioUrl+"listar-valet.php",{

     })
      .done(function( data ) {
        //Llenar los valets
        $.each(data.valets,function(key, registro) {
          $("#slcValets").append ('<option value='+registro.id+'>'+registro.id+"| "+registro.nombre+'</option>');
          $("#slcValets2").append('<option value='+registro.id+'>'+registro.id+"| "+registro.nombre+'</option>');
          cargadoSelectValets=true;
        });
      })
      .fail(function() {
        MostrarAlerta("msg_citasPorRecibir","warning","Ha ocurrido un error al intentar cargar los nombres de los valet");
        MostrarAlerta("msg_citasPorEntregar","warning","Ha ocurrido un error al intentar cargar los nombres de los valet");
        //alert( "Ocurrió un error al intentar cargar los valets");
        return;
      });
  }
}

function AsignarValet(tipo){
  var optionSelected;
  var cita;
  if(tipo==1){  //tipo 1 por recibir.
    optionSelected = $("#slcValets").find("option:selected");
    cita=idCita1;
  }
  else if(tipo==2){ //tipo 2 por entregar.
    optionSelected = $("#slcValets2").find("option:selected");
    cita=idCita3;
  }
  var valueSelected  = optionSelected.val();
  var textSelected   = optionSelected.text();

  //POST
  $.post(sitioUrl+"actualizar-cita-valet.php",{
    cita  : cita,
    valet : valueSelected
  })
  .done(function( data ) {
    console.log(data.estado+data.mensaje);
    if(data.estado==1){//
      if(tipo==1){
        //Actualizar la tabla
        tblCitas1.ajax.reload();
        //mandar a deshabilitar el boton
        $('#btnAsignarValet').prop("disabled",true);
        MostrarAlerta("msg_citasPorRecibir","success",data.mensaje);
        RecargarMapa();
      }
      else if(tipo==2){
        //Actualizar la tabla
        tblCitas3.ajax.reload();
        //mandar a deshabilitar el boton
        $('#btnAsignarValet2').prop("disabled",true);
        MostrarAlerta("msg_citasPorEntregar","success",data.mensaje);
      }
    //  NotificarValet(cita,valueSelected,tipo);
    }
    else{
      if(tipo==1){
        MostrarAlerta("msg_citasPorRecibir","warning",data.mensaje);
      }
      else if (tipo==2){
        MostrarAlerta("msg_citasPorEntregar","warning",data.mensaje);
      }
    }
  })
  .fail(function(error) {
    console.log(error)
    if(tipo==1){
      MostrarAlerta("msg_citasPorRecibir","danger","Ocurrió un error al intentar asignar el valet");
    }
    else if (tipo==2){
      MostrarAlerta("msg_citasPorEntregar","danger","Ocurrió un error al intentar asignar el valet");
    }
    return;
  });
}

/*Funcion sin usar
function NotificarValet(cita,valet,tipo){
  //POST
  $.post(sitioUrl+"Notificacion-valet.php",{
    id  : valet,
    cita : cita
  })
  .done(function( data ) {
      //Llenar los valets
  })
  .fail(function(error) {
    console.log(error)
    if(tipo==1){
      MostrarAlerta("msg_citasPorRecibir","danger","Ocurrió un error al intentar notificar al valet");
    }
    else if (tipo==3){
      MostrarAlerta("msg_citasPorEntregar","danger","Ocurrió un error al intentar notificar al valet");
    }
    return;
  });
}
*/

function ModificarPrecioDescripcionKm(){
  var precio      = $('#inputPrecio').val();
  var descripcion = $('#inputDescripcion').val();
  var kms         = $('#inputKilometraje').val();
  if(precio==""||descripcion==""||kms==""){
    MostrarAlerta("msg_citasPorReparar","warning","No se pueden ingresar los datos del mantenimiento sino ha llenado todos los campos");
  }
  else{
    var r = confirm("¿Está seguro que desea ingresar estos valores a la cita?\n Precio: $"+
          precio+" | Kilometraje: "+kms  +"\n Descripcion: \n " +descripcion ); //r de respuesta
    if (r == true) {  // Presiono OK
      //POST
      $.post(sitioUrl+"actualizarcita-descripcion.php",{
        id           : idCita2,
        descripcion  : descripcion,
        precio       : precio,
        km           : kms
      })
      .done(function( data ) {
          if(data.estado==1){//EXITO
            MostrarAlerta("msg_citasPorReparar","success",data.mensaje);
            //Actualizar la tabla
            tblCitas2.ajax.reload();
            //mandar a deshabilitar el boton
            $('#btnModificarMantenimiento').prop("disabled",true);
            //Blanquear los campos
            $('#inputPrecio').val("");
            $('#inputDescripcion').val("");
            $('#inputKilometraje').val("");
            CargarCitasGrafico();
          }
          else{

            MostrarAlerta("msg_citasPorReparar","warning",data.mensaje);
          }
      })
      .fail(function(error) {
        console.log(error)
        MostrarAlerta("msg_citasPorReparar","danger","Ocurrió un error al intentar actualizar los datos de la cita");
        return;
      });
      }
  }

}

function ConsultarCitaFecha(){
    var timestamp = Date.parse($('#inputFecha').val());

    if (isNaN(timestamp) == false) {
    //  var d = new Date(timestamp);
      var fecha = $('#inputFecha').val().split('-');
        var year = Number(fecha[0]);
        var month = Number(fecha[1]);
        var day = Number(fecha[2]);
        fechaDP=year+"-"+month+"-"+day;
        console.log("Consultando fecha: "+fechaDP);
        //POST
        $.post(sitioUrl+"consultar-cupo-cita-web.php",{
          fecha:fechaDP
         })
          .done(function( data ) {
            console.log("Se consulto con éxito la fecha. EStado:"+data.estado);
            for (var i = 1; i < 5; i++) {//Cambiar las propiedades de todos los botones
                $('#btnBloquear'+i).prop("disabled",false);
                $('#btnBloquear'+i).removeClass("btn-outline-secondary");
                $('#btnBloquear'+i).addClass("btn-primary");
                //Listar cupos en los botones
                $('#spanBloquear'+i).text(""+data.cupo);
            }
            if(data.estado==2){//si hay citas separadas
                $.each(data.horas,function(key, registro) {
                  //Bloquear el boton
                  if(registro.horaCupo==0){
                    $('#btnBloquear'+registro.hora+'').prop("disabled",true);
                    $('#btnBloquear'+registro.hora+'').removeClass("btn-primary");
                    $('#btnBloquear'+registro.hora+'').addClass("btn-outline-secondary");
                  }
                  //Sobre escribir cupos disponible
                  $('#spanBloquear'+registro.hora+'').text(""+registro.horaCupo);
                  console.log("Boton: "+registro.hora+"| Cupo: "+registro.horaCupo)
              });
            }
            else if(data.estado==0||data.estado==1){//Esta todo libre
              MostrarAlerta("msg_separarCita","success",data.mensaje);
            }
          })
          .fail(function() {
            MostrarAlerta("msg_separarCita","danger","Ocurrió un error al intentar cargar las citas de ese día");
            return;
          });
    }
    else{
      MostrarAlerta("msg_separarCita","warning","Para consultar debe escribir una fecha en el formato correcto.");
    }
}

function BloquearHora(idHora,hora){
  var r = confirm("¿Está seguro que desea separar una cita a las "+hora+" el "+fechaDP+"?"); //r de respuesta
  if (r == true) {  // Presiono OK
    console.log("Mandadando a reservar: id="+idHora+". Fecha="+fechaDP);
  $.post(sitioUrl+"separar-cupo-cita.php",{
    hora:idHora,
    fecha:fechaDP
   })
    .done(function( data ) {
      if(data.estado==1){//Exito al bloquear
        if(data.cupo==0){//Si ya se lleno
          $('#btnBloquear'+idHora+'').prop("disabled",true);
          $('#btnBloquear'+idHora+'').removeClass("btn-primary");
          $('#btnBloquear'+idHora+'').addClass("btn-outline-secondary");
        }
        //Sobre escribir cupos disponible
        $('#spanBloquear'+idHora+'').text(""+data.cupo);
        MostrarAlerta("msg_separarCita","success",data.mensaje);
      }
      else if (data.estado==0){
        MostrarAlerta("msg_separarCita","warning",data.mensaje);
      }
    })
    .fail(function() {
      MostrarAlerta("msg_separarCita","danger","Ocurrió un error al intentar reservar su cita a esa hora.");
      return;
    });
  }
}

//************** M A N T E N I M I E N T O - S E M I N U E V O S ***************
function CargarSelectModelos(){
  if(!cargadoSelectModelos){// Solo se carga por primera vez
      //POST
    $.post(sitioUrl+"listar-modelos.php",{

     })
      .done(function( data ) {
          //Llenar los Modelos
          var i=1;
          $.each(data.modelos,function(key, registro) {
            $("#slcModelo3").append('<option>'+registro+'</option>');
            i++;
        });
            cargadoSelectModelos=true;
      })
      .fail(function() {
        MostrarAlerta("msg_seminuevo","warning","Ha ocurrido un error al intentar cargar los modelos");
        return;
      });
  }
}

function CargarDatosSeminuevo(id){
  $.post(sitioUrl+"datos-seminuevo-web.php",{
    id:id
   })
    .done(function( data ) {
      if(data.estado==1){
        var i=1;
        $.each(data.imagenes,function(key, registro) {
          $("#imgSN"+i+"").attr("src",registro.url);
          AlmacenarUrls(i,registro.url);
          i++;
        });
        //Llenar la descripcion del seminuevo
        $("#inputPlaca3").val(""+data.placa);
        $("#inputPrecio3").val(""+data.precio);
        $("#inputKilometraje3").val(""+data.km);
        $("#inputAnio3").val(""+data.anio);
        $("#inputMotor3").val(""+data.motor);
        $("#inputTraccion3").val(""+data.traccion);
        $("#inputEquipamiento").val(""+data.equipamento);
        $("#inputInformacion").val(""+data.informacion);
        if(data.ac==1){
          $("#slcAC3").val("SI");
          console.log("SI TIENE AIRE");
        }
        else if (data.ac==0){
          $("#slcAC3").val("NO");
          console.log("NO TIENE AIRE");
        }
        $("#slcModelo3").val(""+data.nombre);
      }
    })
    .fail(function() {
      MostrarAlerta("msg_seminuevo","warning","Ha ocurrido un error al intentar cargar el seminuevo");
      return;
    });
} //Al hacer click en el DT

function AlmacenarUrls(i,url){
  if(i==1){
    urlImgSeminuevo1=url;
    img1cargada=true;
  }
  else if(i==2){
    urlImgSeminuevo2=url;
    img2cargada=true;
  }
  else if(i==3){
    urlImgSeminuevo3=url;
    img3cargada=true;
  }
  else if(i==4){
    urlImgSeminuevo4=url;
    img4cargada=true;
  }
}

function readURL(input,id) {
  var formData = new FormData($("#uploadimage"+id)[0]);
  var ruta = sitioUrl+"subir-imagen-seminuevo.php";
  //Cargar imagen en el servidor
  $.ajax({
      url: ruta,
      type: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function(data)
      {
        //alert(data.estado);
        if(data.estado==1){//EXITO
          MostrarAlerta("msg_seminuevoImg","success",(data.mensaje));
          if(id==1){
            img1cargada=true;
            urlImgSeminuevo1=(sitioUrl+data.img);
          }
          else if(id==2){
            img2cargada=true;
            urlImgSeminuevo2=(sitioUrl+data.img);
          }
          else if(id==3){
            img3cargada=true;
            urlImgSeminuevo3=(sitioUrl+data.img);
          }
          else if(id==4){
            img4cargada=true;
            urlImgSeminuevo4=(sitioUrl+data.img);
          }
        }else if(data.estado==0){//Algun error
            MostrarAlerta("msg_seminuevoImg","warning",data.mensaje);
        }
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        MostrarAlerta("msg_seminuevoImg","danger",(textStatus+" | "+errorThrown));
    }
  });
  //cargar la imagen en pantalla
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      $('#imgSN'+id).attr('src', e.target.result);
    }
    reader.readAsDataURL(input.files[0]);
  }
}

function GuardarSeminuevo(tipo){
  console.log("url1:"+urlImgSeminuevo1);
  console.log("url2:"+urlImgSeminuevo2);
  console.log("url3:"+urlImgSeminuevo3);
  console.log("url4:"+urlImgSeminuevo4);

  var id = idSeminuevo;
  var ac;
  if($("#slcAC3").val()=="NO"){
    ac=0;
  }
  else if($("#slcAC3").val()=="SI"){
    ac=1;
  }

  if(img1cargada&&img2cargada&&img3cargada&&img3cargada){
    if(VerificarEspaciosSeminuevo()){
      $.post(sitioUrl+"insertar-seminuevo-web.php",{
        id:id,
        modelo:$("#slcModelo3").val(),
        motor:$("#inputMotor3").val(),
        km:$("#inputKilometraje3").val(),
        placa:$("#inputPlaca3").val(),
        anio:$("#inputAnio3").val(),
        precio:$("#inputPrecio3").val(),
        traccion:$("#inputTraccion3").val(),
        equipamiento:$("#inputEquipamiento").val(),
        informacion:$("#inputInformacion").val(),
        ac:ac,
        img1:urlImgSeminuevo1,
        img2:urlImgSeminuevo2,
        img3:urlImgSeminuevo3,
        img4:urlImgSeminuevo4
       })
        .done(function( data ) {
          console.log(data.estado+data.mensaje);
          if(data.estado==0){//EXITO
            if(tipo==1){//ACTUALIZAR
              MostrarAlerta("msg_seminuevo","success","Seminuevo ha sido actualizado con éxito");
            }
            else if (tipo==2){//GUARDAR NUEVO
              MostrarAlerta("msg_seminuevo","success","Seminuevo ha sido guardado con éxito");
            }
            AcomodarBotones(2);
            LimpiarSeminuevo();
            tblSeminuevo.ajax.reload();
          }
          else { //Hubo algun error en el servicio
            MostrarAlerta("msg_seminuevo","warning",data.mensaje);
          }
        })
        .fail(function() {
          if(tipo==1){//ACTUALIZAR
            MostrarAlerta("msg_seminuevo","danger","Ha ocurrido un error al intentar actualizar el seminuevo");
          }
          else if (tipo==2){//GUARDAR NUEVO
            MostrarAlerta("msg_seminuevo","danger","Ha ocurrido un error al intentar guardar el seminuevo");
          }
          tblSeminuevo.ajax.reload();
          return;
        });
    }
    else {
        MostrarAlerta("msg_seminuevo","warning","Llene todos los campos para continuar")
    }
  }
  else{
    MostrarAlerta("msg_seminuevo","warning","Para guardar debe cargar las 4 imágenes")
  }
}

function EliminarSeminuevo(){
  var r = confirm("¿Está seguro de eliminar el seminuevo seleccionado?");
  if (r == true) {
    $.post(sitioUrl+"eliminar-seminuevo.php",{
      id:idSeminuevo
     })
      .done(function( data ) {
        console.log(data.estado+data.mensaje);
        if(data.estado==1){//EXITO AL ELIMINAR
          MostrarAlerta("msg_seminuevo","success",data.mensaje);
          LimpiarSeminuevo();
          AcomodarBotones(2);
        }
        else{// HUBO ALGUN ERROR
          MostrarAlerta("msg_seminuevo","warning",data.mensaje);
          console.log(data.mensaje);
        }
        tblSeminuevo.ajax.reload();
      })
      .fail(function() {
        MostrarAlerta("msg_seminuevo","danger","Ha ocurrido un error al intentar eliminar el seminuevo");
        return;
      });
  }
}

function VerificarEspaciosSeminuevo(){
  if(
    $('#inputPlaca3').val()==""||
    $('#inputPrecio3').val()==""||
    $('#inputKilometraje3').val()==""||
    $('#inputAnio3').val()==""||
    $('#inputMotor3').val()==""||
    $('#inputTraccion3').val()==""||
    $('#inputEquipamiento').val()==""||
    $('#inputInformacion').val()=="")
    {
    return false;//Hay Campos en blanco
  }
  else {
    return true; //Todo esta lleno
  }
}

function AcomodarBotones(tipo){
  if(tipo==1){//actualizar y eliminar
    $('#btnEliminarSeminuevo').prop("disabled",false);
    $('#btnModificarSeminuevo').prop("disabled",false);
    $('#btnGuardarSeminuevo').prop("disabled",true);
    $('#btnEliminarSeminuevo').removeClass("btn-outline-secondary");
    $('#btnEliminarSeminuevo').addClass("btn-danger");
    $('#btnModificarSeminuevo').removeClass("btn-outline-secondary");
    $('#btnModificarSeminuevo').addClass("btn-info");
    $('#btnGuardarSeminuevo').removeClass("btn-primary");
    $('#btnGuardarSeminuevo').addClass("btn-outline-secondary");
  }
  else if(tipo==2){ //guardar
    $('#btnEliminarSeminuevo').prop("disabled",true);
    $('#btnModificarSeminuevo').prop("disabled",true);
    $('#btnGuardarSeminuevo').prop("disabled",false);
    $('#btnEliminarSeminuevo').removeClass("btn-danger");
    $('#btnEliminarSeminuevo').addClass("btn-outline-secondary");
    $('#btnModificarSeminuevo').removeClass("btn-info");
    $('#btnModificarSeminuevo').addClass("btn-outline-secondary");
    $('#btnGuardarSeminuevo').removeClass("btn-outline-secondary");
    $('#btnGuardarSeminuevo').addClass("btn-primary");
  }
}

function LimpiarSeminuevo(){
  //Limpiar todas las variables
  $('#file1').val(null);
  $('#file2').val(null);
  $('#file3').val(null);
  $('#file4').val(null);
  $('#imgSN1').attr("src",sitioUrl+"img-dashboard/camara-preview.png");
  $('#imgSN2').attr("src",sitioUrl+"img-dashboard/camara-preview.png");
  $('#imgSN3').attr("src",sitioUrl+"img-dashboard/camara-preview.png");
  $('#imgSN4').attr("src",sitioUrl+"img-dashboard/camara-preview.png");
  $('#inputPlaca3').val("");
  $('#inputPrecio3').val("");
  $('#inputKilometraje3').val("");
  $('#inputAnio3').val("");
  $("#slcModelo3").val($("#slcModelo3 option:first").val());
  $('#inputMotor3').val("");
  $('#inputTraccion3').val("");
  $("#slcAC3").val($("#slcAC3 option:first").val());
  $('#inputEquipamiento').val("");
  $('#inputInformacion').val("");
  img1cargada=false;
  img2cargada=false;
  img3cargada=false;
  img4cargada=false;
  idSeminuevo="";
}

//*************** M A N T E N I M I E N T O - E M P L E A D O S ****************
function CambiarTipoEmpleado(){
  var optionSelected = $('#inputTipo').find("option:selected");
  var valueSelected  = optionSelected.val();
  var textSelected   = optionSelected.text();

  if(textSelected=="administrador"){
    $('#inputUsuario').val("admin"+$('#inputNombre').val());
  }
  else if(textSelected=="valet"){
    $('#inputUsuario').val("valet"+$('#inputNombre').val());
  }
}

function LlenarUsuario(){
  if( $('#inputTipo').val()=="administrador"){
    $('#inputUsuario').val("admin"+$('#inputNombre').val());
  }
  else if( $('#inputTipo').val()=="valet"){
    $('#inputUsuario').val("valet"+$('#inputNombre').val());
  }
}

function AgregarUsuario(){
  //Seleccionar Tipo
  var tipo = 0;
  if( $('#inputTipo').val()=="administrador"){
    tipo = 1;
  }
  else if( $('#inputTipo').val()=="valet"){
    tipo=3;
  }
  //Comprobar Contraseña
  var pass1 = $('#inputPass').val();
  if($('#inputPass').val()!=$('#inputPass2').val()){//Contraseñas no coinciden
    MostrarAlerta("msg_registrarEmpleado","warning","Las contraseñas no coinciden");
    return;
  }
  else {
    if($('#inputPass').val().length<6){
      MostrarAlerta("msg_registrarEmpleado","warning","Las contraseñas deben tener como mínimo 6 caracteres");
      return;
    }
    else{
    //POST
    $.post(sitioUrl+"agregar-usuario.php",{
      tipo_user: tipo,
      user: $('#inputUsuario').val(),
      user_pass: $('#inputPass').val(),
      telefono: $('#inputTelefono').val(),
      nombre: $('#inputNombre').val(),
      apellido: $('#inputApellido').val(),
      mail: $('#inputCorreo').val()
     })
      .done(function( data ) {
        if(data.estado==2){
          console.log("ID del nuevo: "+data.id)
          MostrarAlerta("msg_registrarEmpleado","success",data.mensaje);
          AgregarUsuarioFirebase(data.id);
          if(tipo==3){
            $('#slcValets').empty();//Vaciar select
            $('#slcValets2').empty();//Vaciar select
            cargadoSelectValets=false;//Permitir recargar el Slc Valets
          }
        }
        else{
          MostrarAlerta("msg_registrarEmpleado","warning",data.mensaje);
        }
      })
      .fail(function() {
        MostrarAlerta("msg_registrarEmpleado","danger","Ocurrió un error al intentar guardar este usuario nuevo")
        return;
      });
    }
  }
}

function AgregarUsuarioFirebase(id){
  console.log("agregarusuarioF");
  var c = $('#inputCorreo').val();
  var p = $('#inputPass').val();
  //Guardar en firebase
  firebase.auth().createUserWithEmailAndPassword(c, p)
    .then(function(user){
      console.log ("Se ha creado el usuario con uid: "+user.uid);
      //Mandar a agregar el campo UID en el nuevo registro de Usuario
      IngresarUidEmpleado(id,user.uid);
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode == 'auth/weak-password') {
        MostrarAlerta("msg_registrarEmpleado","warning","Contraseña muy débil");
      }
      else {
        MostrarAlerta("msg_registrarEmpleado","danger",errorMessage);
      }
        console.log(error);
    });
}

function IngresarUidEmpleado(id,uid){
  //POST
    console.log("IngresarUidEmpleado. id: "+id+" |uid: "+uid);
  $.post(sitioUrl+"ingresar-uid-empleado.php",{
    id: id,
    uid: uid
   })
    .done(function( data ) {
      if(data.estado==0){
        MostrarAlerta("msg_registrarEmpleado","success","El nuevo usuario ya puede recibir notificaciones");
      }
        //alert("se guardo en la base el UID: "+uid+" para el id: "+id);
    })
    .fail(function() {
      MostrarAlerta("msg_registrarEmpleado","danger","Error al guardar el UID en la base de datos");
    });
}

function EliminarEmpleadoFirebase(tipo){
  var idSeleccionado;
  var nombreSeleccionado;
  if(tipo==1){
    idSeleccionado      = idAdministradorSeleccionado;
    nombreSeleccionado  = nombreAdministradorSeleccionado;
  }
  else if (tipo==3){
    idSeleccionado      = idValetSeleccionado;
    nombreSeleccionado  = nombreValetSeleccionado;
  }
  //Primero consultar el uid segun el id
  var uid;
  //Levantar un promt para asegurarse de borrar
  var r = confirm("¿Está seguro que desea eliminar al empleado "+
  nombreSeleccionado+" ? \n Esta acción no se puede deshacer"); //r de respuesta
  if (r == true) {  // Presiono OK
    $.post(sitioUrl+"datos-usuario.php",
    {
      id:idSeleccionado
    })
    .done(function(data) {
    uid = data.uid;
    console.log("Se va a eliminar el usuario con UID: "+uid)
    //Si se encuentra uid ELIMINAR del firebase
        $.post('/delete',
        {
          uid: uid
        })
        .done(function(){
          EliminarEmpleadoBD(idSeleccionado,tipo);
          console.log("Si se envio al index.js el post");
        })
        .fail(function() {
          console.log("No se envio al index.js el post");
        });
    })
    .fail(function() {
      console.log("No se pudo obtener UID en la BD de este usuario");
    });
  }
}

function EliminarEmpleadoBD(id,tipo){
    //POST
    $.post(sitioUrl+"eliminar-usuario.php",{
      id: id,
      tipo: tipo
     })
      .done(function( data ) {
        if(data.estado==1){//Exito al elininar

          if(tipo==1){//Administrador
            tblAdministrador.row('.selected').remove().draw( false );
            $('#btnEliminarA').prop("disabled",true);
            $('#btnEliminarA').removeClass("btn-danger");
            $('#btnEliminarA').addClass("btn-outline-secondary")
            MostrarAlerta("msg_eliminarAdministrador","success",data.mensaje);
          }
          else if (tipo==3){//Valet
            tblValet.row('.selected').remove().draw( false );
            $('#btnEliminarV').prop("disabled",true);
            $('#btnEliminarV').removeClass("btn-danger");
            $('#btnEliminarV').addClass("btn-outline-secondary")
            MostrarAlerta("msg_eliminarValet","success",data.mensaje);
          }
        }
        else{
          if(tipo==1){//Administrador
            MostrarAlerta("msg_eliminarAdministrador","warning",data.mensaje);
          }
          else if (tipo==3){//Valet
            MostrarAlerta("msg_eliminarValet","warning",data.mensaje);
          }
        }
      })
      .fail(function() {
        if(tipo==1){//Administrador
          MostrarAlerta("msg_eliminarAdministrador","danger","Ocurrió un error al intentar eliminar este empleado");
        }
        else if (tipo==3){//Valet
          MostrarAlerta("msg_eliminarValet","danger","Ocurrió un error al intentar eliminar este empleado");
        }
      });
}


//****************** M A N T E N I M I E N T O - P E R F I L *******************
function editarPerfil(x){
  var valorP;
  if(x==1){     //**** NOMBRE  *****
    var valorP = prompt("Modifique su nombre:", nombreUsuario);
    if (valorP != null) { // Si presiono OK
      if(valorP!=""){
        //Guardar en la Base de datos
        ActualizarPerfil(valorP,"","","");
      }
      else{
        MostrarAlerta("msg_perfil","warning","Nombre no puede quedar vacío");
      }
    }
  }
  else if(x==2){//**** APELLIDO  *****
    var valorP = prompt("Modifique su apellido:", apellidoUsuario);
    if (valorP != null) { // Si presiono OK
      if(valorP!=""){
        //Guardar en la Base de datos
        ActualizarPerfil("",valorP,"","");
      }
      else{
        MostrarAlerta("msg_perfil","warning","Apellido no puede quedar vacío");
      }
    }
  }
  else if(x==3){//**** TELEFONO  *****
    var valorP = prompt("Modifique su teléfono:", telefonoUsuario);
    if (valorP != null) { // Si presiono OK
      if(valorP!=""){
        //Guardar en la Base de datos
        ActualizarPerfil("","",valorP,"");
      }
      else{
        MostrarAlerta("msg_perfil","warning","Telefono no puede quedar vacío");
      }
    }
  }
  else if(x==4){//**** CORREO  *****
    var valorP = prompt("Modifique su correo electrónico:", correoUsuario);
    if (valorP != null) { // Si presiono OK
      if(valorP!=""){
        //Guardar en la Base de datos
        ActualizarPerfil("","","",valorP);
      }
      else{
        MostrarAlerta("msg_perfil","warning","Correo no puede quedar vacío");
      }
    }
  }
  else if(x==5){//**** CONTRASEÑA  *****
    var valorP = prompt("Escriba su contraseña anterior:", "");
    var passVieja = passUsuario;
    if (valorP != null) { // Si presiono OK
      if (valorP.length>5){

        if(valorP!=passVieja){//No coinciden contraseñas con la vieja
          MostrarAlerta("msg_perfil","warning","Esta no es su contraseña actual");
        }
        else{//Si escribio bien la contraseña vieja
          var valorP1 = prompt("Escriba su nueva contraseña:", "");
          if (valorP1 != null) { // Si presiono OK
            if(valorP1.length>5){
              var valorP2 = prompt("Escriba de nuevo su nueva contraseña:", "");
              if (valorP2 != null) { // Si presiono OK
                  if(valorP2.length>5){
                    if(valorP1==valorP2){//si coinciden
                      //Guardar en la Base de datos
                      ActualizarPass(passVieja,valorP2);
                    }
                    else{
                      MostrarAlerta("msg_perfil","warning","Las contraseñas no coinciden");
                    }
                  }
                  else{
                      MostrarAlerta("msg_perfil","warning","La nueva contraseña debe tener al menos 6 caracteres");
                  }
              }
            }
            else {
              MostrarAlerta("msg_perfil","warning","La nueva contraseña debe tener al menos 6 caracteres");
            }
          }
        }
      }
      else {
        MostrarAlerta("msg_perfil","warning","La contraseña debe tener al menos 6 caracteres");
      }
    }
  }
}

function ActualizarPerfil(name,lastname,celular,mail){
  if(name==""){
    name=nombreUsuario;
  }
  if(lastname==""){
    lastname=apellidoUsuario;
  }
  if(celular==""){
    celular=telefonoUsuario;
  }
  if(mail==""){
    mail=correoUsuario;
  }


  //POST
  $.post(sitioUrl+"editar-usuario.php",{
    id: localStorage.getItem("id"),
    tipo: tipoUsuario,
    name: name,
    lastname: lastname,
    mail: mail,
    celular: celular
   })
    .done(function( data ) {
      if(data.estado==2){//Exito al actualizar
        MostrarAlerta("msg_perfil","success",data.mensaje);
        CambiarDatosPerfil(name,lastname,celular,mail);
      }
      else if(data.estado==3){//Contraseña ya existen
        MostrarAlerta("msg_perfil","warning",data.mensaje);
      }
    })
    .fail(function() {
      MostrarAlerta( "msg_perfil","danger","Ocurrió un error al intentar actualizar los datos");
    });
}

function CambiarDatosPerfil(nombre,apellido,telefono,correo){//localStorage y valores en pantalla
  //Guardar Local en la variable
  nombreUsuario = nombre;
  apellidoUsuario = apellido;
  telefonoUsuario = telefono;
  correoUsuario = correo;
  //Guardar Local Storage
  localStorage.setItem("nombre",nombre);
  localStorage.setItem("apellido",apellido);
  localStorage.setItem("telefono",telefono);
  localStorage.setItem("correo",correo);
  //Poner en tarjeta
  $('#cardNombre').val(nombre);
  $('#cardApellido').val(apellido);
  $('#cardTelefono').val(telefono);
  $('#cardCorreo').val(correo);
  //poner en el Sidebar
  $('#txtNombre').html(nombre);
}

function ActualizarPass(vieja,nueva){
  //POST
  $.post(sitioUrl+"usuario-password.php",{
    id: localStorage.getItem("id"),
    tipo: tipoUsuario,
    user: "",
    oldpass: vieja,
    newpass: nueva,
    navegador:1
   })
    .done(function( data ) {
      if(data.estado==3){//Exito al cambiar contraseña
        //MostrarAlerta("msg_perfil","success",data.mensaje);
        editarPassFirebase(nueva);
      }
      else{
        MostrarAlerta("msg_perfil","warning",data.mensaje);
      }
    })
    .fail(function() {
      MostrarAlerta("msg_perfil","danger","Ocurrió un error al intentar actualizar los datos");
    });
}

function editarPassFirebase(contra){
  var user = firebase.auth().currentUser;
  var newPassword = contra;
  //Para evitar problemas al actualizar contraseña en Firebase
  //Primero desloguearme
  firebase.auth().signOut()
    .then(function(){
      //Luego loguearme de nuevo
      firebase.auth().signInWithEmailAndPassword(correoUsuario, passUsuario)
        .then(function(){
          //Finalmente proceder a actualizar
          user.updatePassword(newPassword)
            .then(function() {//Se actualizo en firebase bien
              //Guardar Local Storage y en la variable
              passUsuario = contra;
              localStorage.setItem("pass",contra);
              MostrarAlerta("msg_perfil","success","Contraseña actualizada exitosamente");
            }).catch(function(error) {
              // An error happened.
              MostrarAlerta("msg_perfil","danger",("Error:"+error));
          });
        });
    });
}

//******************************** M A P A S ***********************************
function RecargarMapa(){
  map=null;
  markers1=[];
  markers1.length=0;
  markers2=[];
  markers2.length=0;
  markers3=[];
  markers3.length=0;
  initMap();
}

function initMap() {
  var zentrum = {lat: -2.169172, lng: -79.919128};//Zentrum
  var tipo;
  map = new google.maps.Map(document.getElementById('map'), {
   zoom: 12,
   center: zentrum
  });
  $.post(sitioUrl+"citas-estado.php",{
    estado:"recibir",//recibir y  entregado
    estado_cita_app:null
   })
    .done(function( data ) {
      if(data.estado==2){//Si hay citas para mostrar
        //Llenar los Marcadores
        $.each(data.citas,function(key, registro) {
          var position={lat: registro.latitud, lng: registro.longitud};
          tipo=1;
          if(registro.valet==""||registro.valet==null){
            tipo=3;//Mandar a otro arreglo de marcadores
          }
          addMarker(position,("Por recibir: "+registro.auto),tipo);
      });
      }
    })
    .fail(function() {
      MostrarAlerta("msg_mapa","danger","Ocurrió un error al intentar cargar citas por Recibir");
      return;
    });

    $.post(sitioUrl+"citas-estado.php",{
      estado:"entregado",//recibir y  entregado
      estado_cita_app:null
     })
      .done(function( data ) {
        if(data.estado==2){//Si hay citas para mostrar
          //Llenar los Marcadores
          $.each(data.citas,function(key, registro) {
            var position={lat: registro.latitud, lng: registro.longitud};
            tipo=2;
            if(registro.valet==""||registro.valet==null){
              tipo=3;
            }

            addMarker(position,("Por entregar: "+registro.auto),tipo);
        });
        }
      })
      .fail(function() {
        MostrarAlerta("msg_mapa","danger","Ocurrió un error al intentar cargar citas por Entregar");
        return;
      });
} //Inicializar el mapa

function addMarker(location,title,tipo) {
    var img;
    if(tipo==1){//recibir
      img=sitioUrl+"img-dashboard/icons/porRecibir.png";
    }
    else if(tipo==2){//entregar
      img=sitioUrl+"img-dashboard/icons/porEntregar.png";
    }
      else if(tipo==3){//valet no asignado
        img=sitioUrl+"img-dashboard/icons/sinValet.png";
    }
    if(location.lat!=null&&location.lng!=null){
      var marker = new google.maps.Marker({
        position: location,
        map: map,
        icon:img,
        animation:google.maps.Animation.DROP,
        title:title
      });
      if(tipo==1){
        markers1.push(marker);
        $('#spanBtnRecibir').text(""+markers1.length);
      }
      else if(tipo==2){
        markers2.push(marker);
        $('#spanBtnEntregar').text(""+markers2.length);
      }else if(tipo==3){
        markers3.push(marker);
        $('#spanBtnNoAsignado').text(""+markers3.length);
        $('#spanBtnRecibir2').text(""+markers3.length);
        $('#spanBtnRecibir3').text(""+markers3.length);
      }
      var span = markers3.length+markers2.length+markers1.length;

      $('#spanBtnTodos').text(""+span);
    }

    }
    // Sets the map on all markers in the array.

function setMapOnAllMarkers(tipo,map) {//Editar todos los marcadores a la vez
  if(tipo==1){
    for (var i = 0; i < markers1.length; i++) {
      markers1[i].setMap(map);
    }
  }
  else if(tipo==2){
    for (var i = 0; i < markers2.length; i++) {
      markers2[i].setMap(map);
    }
  }
  else if(tipo==3){
    for (var i = 0; i < markers3.length; i++) {
      markers3[i].setMap(map);
    }
  }
}

function MostrarMarcadores(tipo){
  //location.reload(); //Actualizar toda la Pagina
  if(tipo==0){//Mostrar todos
    setMapOnAllMarkers(1,map);
    setMapOnAllMarkers(2,map);
    setMapOnAllMarkers(3,map);
  }
  else if(tipo==1){//Mostrar solo recibir asignado
    setMapOnAllMarkers(1,map);
    setMapOnAllMarkers(2,null);
    setMapOnAllMarkers(3,null);
  }
  else if(tipo==2){//Mostrar solo entregar
    setMapOnAllMarkers(1,null);
    setMapOnAllMarkers(2,map);
    setMapOnAllMarkers(3,null);
  }
  else if(tipo==3){//Mostrar solo recibir no asignado
    setMapOnAllMarkers(1,null);
    setMapOnAllMarkers(2,null);
    setMapOnAllMarkers(3,map);
  }
}

function toggleBounce() { //Rebotar
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}

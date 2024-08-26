	create table articulos (
	idarticulo int primary key identity(1,1),
	articulo nvarchar(100),
	estatus nvarchar(20),
	fechacreate datetime,
	codarticulo VARCHAR(50)
	)




	create table sub_articulo (
	id int primary key identity(1,1),
	idsubartic int ,
	descripcion nvarchar(200),
	estatus nvarchar(20),
	fechacreate datetime,
	comentario nvarchar(max),
	urlimagen nvarchar(max),
	codarticulo VARCHAR(50),
	ind_principal VARCHAR(1),
	grupo_principal int,
	precio numeric(10,2)
	)

	ALTER TABLE sub_articulo
	ADD id INT AUTO_INCREMENT PRIMARY KEY;

	alter table sub_articulo add idsubartic int references articulos (idarticulo)
	ALTER TABLE sub_articulo ADD codarticulo VARCHAR(50);
	ALTER TABLE sub_articulo ADD ind_principal VARCHAR(1);
	ALTER TABLE sub_articulo ADD grupo_principal int;
	ALTER TABLE sub_articulo ADD precio numeric(10,2);


	create table usuarios (
codigo nvarchar(50),
clave nvarchar(100),
estatus nvarchar(20),
fechacreate datetime
)

------ my sql

CREATE TABLE articulos (
    idarticulo INT PRIMARY KEY AUTO_INCREMENT,
    articulo VARCHAR(100),
    estatus VARCHAR(20),
    fechacreate DATETIME
);

CREATE TABLE sub_articulo (
    idsubartic INT PRIMARY KEY,
    descripcion VARCHAR(200),
    estatus VARCHAR(20),
    fechacreate DATETIME,
    comentario TEXT,
    urlimagen TEXT,
    CONSTRAINT fk_articulos FOREIGN KEY (idsubartic) REFERENCES articulos(idarticulo)
);


CREATE TABLE usuarios (
    codigo VARCHAR(50),
    clave VARCHAR(100),
    estatus VARCHAR(20),
    fechacreate DATETIME
);



DELIMITER //

CREATE PROCEDURE usp_mostrar_productos(
    IN textosearch VARCHAR(200)
)
BEGIN
    -- Seleccionar los resultados con el texto de búsqueda
    SELECT 
        a.idarticulo,
        a.articulo,
        a.estatus AS estatus_articulo,
        a.fechacreate AS fecha_create_articulo,
        a.codarticulo AS cod_articulo,
        sb.idsubartic,
        sb.descripcion,
        sb.estatus AS estatus_sub_articulo,
        sb.fechacreate AS fecha_create_sub_articulo,
        sb.comentario,
        sb.urlimagen,
        sb.codarticulo AS cod_articulo_sub,
        sb.ind_principal,
        sb.grupo_principal,
        sb.precio,
        CONCAT(a.articulo, ' ', sb.descripcion) AS desc_articulo
    FROM articulos a
    JOIN sub_articulo sb ON sb.idsubartic = a.idarticulo
    WHERE 
        (textosearch = '' OR textosearch = '0' OR a.articulo LIKE CONCAT('%', textosearch, '%') OR sb.descripcion LIKE CONCAT('%', textosearch, '%'))
        AND a.estatus = 'ACT'
    ORDER BY a.codarticulo, a.idarticulo;

END //

DELIMITER ;

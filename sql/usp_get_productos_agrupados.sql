DELIMITER //

CREATE PROCEDURE usp_get_productos_agrupados()
BEGIN
    -- Seleccionar productos agrupados por grupo_principal
    SELECT
        sb.id, 
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
        CONCAT(IFNULL(a.articulo, ''), ' ', IFNULL(sb.descripcion, '')) AS desc_articulo
    FROM 
        articulos a
    JOIN 
        sub_articulo sb ON sb.idsubartic = a.idarticulo
    WHERE 
        sb.grupo_principal IN (1, 2, 3) -- Filtrar por los grupos deseados
    ORDER BY 
        sb.grupo_principal, -- Ordenar por grupo principal
        a.idarticulo;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE usp_serch_articulos(
    IN p_textosearch  VARCHAR(200),
    IN p_estatus      VARCHAR(50),
    IN p_PageIndex    INT,
    IN p_PageSize     INT,
    OUT p_totalrows   INT,
    OUT p_firstrow    INT,
    OUT p_lastrow     INT
)
BEGIN
    DECLARE v_PageIni INT;
    DECLARE v_PageEnd INT;

    -- Ajustar PageIndex en caso de ser 0
    SET p_PageIndex = IF(p_PageIndex = 0, 1, p_PageIndex);

    -- Calcular los valores para la paginación
    SET v_PageEnd = p_PageIndex * p_PageSize;
    SET v_PageIni = (v_PageEnd - p_PageSize) + 1;

    -- Contar el número total de registros
    SELECT COUNT(*) INTO p_totalrows
    FROM (
        SELECT 
            a.idarticulo,
            a.articulo,
            a.estatus AS estatus_articulo,
            a.fechacreate AS fecha_create_articulo,
            a.codarticulo AS cod_articulo,
            sb.idsubartic,
			sb.id,
            sb.descripcion,
            sb.estatus AS estatus_sub_articulo,
            sb.fechacreate AS fecha_create_sub_articulo,
            sb.comentario,
            sb.urlimagen,
            sb.codarticulo AS cod_articulo_sub,
            sb.ind_principal,
            sb.grupo_principal,
            sb.precio,
            CONCAT_WS(' ', a.articulo, sb.descripcion) AS desc_articulo,
            ROW_NUMBER() OVER (ORDER BY a.idarticulo) AS Linea
        FROM articulos a
        JOIN sub_articulo sb ON sb.idsubartic = a.idarticulo
        WHERE 
            (p_textosearch = '' OR a.articulo LIKE CONCAT('%', p_textosearch, '%') OR sb.descripcion LIKE CONCAT('%', p_textosearch, '%'))
            AND (a.estatus = p_estatus OR p_estatus IS NULL)
            AND (sb.estatus = p_estatus OR p_estatus IS NULL)
    ) AS ResultCount;

    -- Seleccionar los resultados paginados
    SELECT 
        idarticulo,
        articulo,
        estatus_articulo,
        fecha_create_articulo,
        cod_articulo,
        idsubartic,
		id,
        descripcion,
        estatus_sub_articulo,
        fecha_create_sub_articulo,
        comentario,
        urlimagen,
        cod_articulo_sub,
        ind_principal,
        grupo_principal,
        precio,
        desc_articulo
    FROM (
        SELECT 
            a.idarticulo,
            a.articulo,
            a.estatus AS estatus_articulo,
            a.fechacreate AS fecha_create_articulo,
            a.codarticulo AS cod_articulo,
            sb.idsubartic,
			sb.id,
            sb.descripcion,
            sb.estatus AS estatus_sub_articulo,
            sb.fechacreate AS fecha_create_sub_articulo,
            sb.comentario,
            sb.urlimagen,
            sb.codarticulo AS cod_articulo_sub,
            sb.ind_principal,
            sb.grupo_principal,
            sb.precio,
            CONCAT_WS(' ', a.articulo, sb.descripcion) AS desc_articulo,
            ROW_NUMBER() OVER (ORDER BY a.idarticulo) AS Linea
        FROM articulos a
        JOIN sub_articulo sb ON sb.idsubartic = a.idarticulo
        WHERE 
            (p_textosearch = '' OR a.articulo LIKE CONCAT('%', p_textosearch, '%') OR sb.descripcion LIKE CONCAT('%', p_textosearch, '%'))
            AND (a.estatus = p_estatus OR p_estatus IS NULL)
            AND (sb.estatus = p_estatus OR p_estatus IS NULL)
    ) AS PaginatedResult
    WHERE Linea BETWEEN v_PageIni AND v_PageEnd;

    -- Establecer valores de salida
    SET p_firstrow = v_PageIni;
    SET p_lastrow = v_PageEnd;

    -- Ajustar p_lastrow si excede el número total de registros
    IF p_lastrow > p_totalrows THEN
        SET p_lastrow = p_totalrows;
    END IF;
END //

DELIMITER ;
CREATE OR ALTER PROCEDURE usp_serch_articulos
    @textosearch  NVARCHAR(200) = '',
    @estatus      NVARCHAR(50),
    @PageIndex    INT,
    @PageSize     INT = NULL, 
    @totalrows    INT OUTPUT, 
    @firstrow     INT OUTPUT,
    @lastrow      INT OUTPUT
AS
BEGIN
    -- Definir variables para paginación
    DECLARE @PageIni INT;
    DECLARE @PageEnd INT;

    -- Ajustar PageIndex en caso de ser 0
    SET @PageIndex = CASE WHEN @PageIndex = 0 THEN 1 ELSE @PageIndex END;

    -- Calcular los valores para la paginación
    SET @PageEnd = @PageIndex * @PageSize;
    SET @PageIni = (@PageEnd - @PageSize) + 1;

    -- Filtrar y seleccionar datos usando ROW_NUMBER() para paginación
    SELECT 
        @totalrows = COUNT(*)
    FROM 
        (
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
                ISNULL(a.articulo + ' ' + sb.descripcion, '') AS desc_articulo,
                ROW_NUMBER() OVER (ORDER BY a.idarticulo) AS Linea
            FROM articulos a
            JOIN sub_articulo sb ON sb.idsubartic = a.idarticulo
            WHERE 
                (@textosearch = '' OR a.articulo LIKE '%' + @textosearch + '%' OR sb.descripcion LIKE '%' + @textosearch + '%')
                AND (a.estatus = @estatus OR @estatus IS NULL)
                AND (sb.estatus = @estatus OR @estatus IS NULL)
        ) AS ResultCount;

    -- Seleccionar los resultados paginados
    SELECT 
        idarticulo,
        articulo,
        estatus_articulo,
        fecha_create_articulo,
        cod_articulo,
        idsubartic,
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
    FROM 
        (
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
                ISNULL(a.articulo + ' ' + sb.descripcion, '') AS desc_articulo,
                ROW_NUMBER() OVER (ORDER BY a.idarticulo) AS Linea
            FROM articulos a
            JOIN sub_articulo sb ON sb.idsubartic = a.idarticulo
            WHERE 
                (@textosearch = '' OR a.articulo LIKE '%' + @textosearch + '%' OR sb.descripcion LIKE '%' + @textosearch + '%')
                AND (a.estatus = @estatus OR @estatus IS NULL)
                AND (sb.estatus = @estatus OR @estatus IS NULL)
        ) AS PaginatedResult
    WHERE Linea BETWEEN @PageIni AND @PageEnd;

    -- Establecer valores de salida
    SET @firstrow = @PageIni;
    SET @lastrow = @PageEnd;

    -- Ajustar @lastrow si excede el número total de registros
    IF @lastrow > @totalrows
    BEGIN
        SET @lastrow = @totalrows;
    END
END

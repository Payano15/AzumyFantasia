DELIMITER $$

CREATE PROCEDURE usp_manage_productos(
    IN p_id INT,
    IN p_desc_articulo TEXT,
    IN p_precio DECIMAL(10,2),
    IN p_urlimagen VARCHAR(255),
    IN p_ind_principal VARCHAR(10),
    IN p_grupo VARCHAR(10),
    OUT o_message VARCHAR(255)
)
BEGIN
    -- Variable local para verificar la existencia del producto
    DECLARE v_idarticulo INT;

    -- Verifica si el producto existe
    SELECT id INTO v_idarticulo
    FROM sub_articulo
    WHERE id = p_id;

    -- Si el producto existe, actualizarlo
    IF v_idarticulo IS NOT NULL THEN
        UPDATE sub_articulo
        SET
            descripcion = p_desc_articulo,
            urlimagen = p_urlimagen,
            ind_principal = p_ind_principal,
            grupo_principal = p_grupo,
            precio = p_precio
        WHERE id = p_id;

        SET o_message = 'Producto actualizado exitosamente';
    ELSE
        -- Si el producto no existe, establecer un mensaje de error
        SET o_message = 'Producto no encontrado';
    END IF;
END $$

DELIMITER ;

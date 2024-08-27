DELIMITER $$

CREATE PROCEDURE activar_sub_articulo(
    IN id INT
)
BEGIN
    UPDATE sub_articulo 
    SET estatus = 'ACT'
    WHERE id = id;
END $$

DELIMITER ;
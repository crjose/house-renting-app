// tslint:disable: variable-name

import Landlord from '../models/User';
import sequelize from 'sequelize';

const Op = sequelize.Op;


export default class LandlordController {

  public async signUp (req, res) {
    try {
      const { email, password, name, phoneNumber } = req.body;

      const userFound = await Landlord.findOne({
        where : {
          email: {
            [Op.like]: email
          }
        }
      });
      if ( userFound ) {
        return res.status(409).json({
          statusCode: 409,
          message: 'Email has already been taken'
        });
      } else {
        const user = await Landlord.create({
          email,
          password,
          name,
          phoneNumber
        });
        const token = user.generateAuthToken();
        res.status(201).json({
          statusCode: 201,
          user,
          token
        });
      }
    } catch (error) {
      return res.status(500).json({
        statusCode: 500, message: 'Server error'
      });
    }
  }

  public async login(req, res) {
    try {
      const { email, password } = req.body;
      const userFound = await Landlord.findOne({
        where: {
          email: {
            [Op.like]: email,
          }
        }
      });
      if (!userFound) {
        return res.status(401).json({
          statusCode: 401,
          message: 'Invalid Credentials'
        });
      } else if(!userFound.validPassword(password)) {
        return res.status(401).json({
          statusCode: 401,
          message: 'Invalid Credentials'
        });
      }
      const token = userFound.generateAuthToken();
      return res.status(200).json({
        user:
          userFound
        ,
        message: `Welcome back ${userFound.name}`,
        token
      });
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        message: 'Server error'
      });
    }
  }

  public async update(req, res) {
    try {
      const { id } = req.params;
      const { name, phoneNumber } = req.body;
      const updateData : any = {};
      if (name) {
        updateData.name = name;
      }
      if (phoneNumber) {
        updateData.phoneNumber = phoneNumber;
      }

      if (!name && !phoneNumber) {
        return res.status(400).json({
          message: 'Please provide a name, phoneNumber or both'
        })
      }

      updateData.returning = true;
      updateData.plain = true;

      const userFound = await Landlord.findByPk(parseInt(id, 10));
      if (!userFound) {
        return res.status(404).json({
          message: 'User not found.'
        });
      } else {
        const updatedUser = await userFound.update(updateData);
        return res.status(200).json({
          landlord: updatedUser.toJSON()
        })
      }
    } catch (error) {
        return res.status(500).json({
          message: 'Server Error'
        });
    }
  }
}
